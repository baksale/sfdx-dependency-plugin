import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { PackageDependencyApi } from '../../lib/packageDependency';
import { DependencyTreeBuilder } from 'any-dependency-tree/dist';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Package2Version, Package2 } from '../../lib/model';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-dependency-plugin', 'org');

export default class Tree extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx dependency:order --package '04t0..'
 04t01..
 04t02..
 04t03..
 04t04..
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-p, --package=VALUE)
    package: flags.string({char: 'p', description: messages.getMessage('packageFlagDescription')}),
    id: flags.boolean({description: messages.getMessage('idFlagDescription'), default: true}),
    name: flags.boolean({char: 'n', description: messages.getMessage('nameFlagDescription'), default: false}),
    version: flags.boolean({description: messages.getMessage('packageVersionDescription'), default: false}),
    maxversion: flags.boolean({char: 'x', description: messages.getMessage('maxVersionFlagDescription'), default: false})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static requiresDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    let packageId:string = this.flags.package;
    if(packageId == null){ return {errorMessage: messages.getMessage('errorNoPackageProvided')}}
    packageId = packageId.replace('\'', '').replace('\'', '');
    const dependencyApi = new PackageDependencyApi(this.hubOrg.getConnection());
    const dependencyBuilder = new DependencyTreeBuilder<Package2Version>(dependencyApi);
    const dxPackages: Package2Version[] = await dependencyApi.getPackagesByIds([packageId]);
    const dxPackage: Package2Version = dxPackages[0];
    const rootNode: DependencyTreeNode<Package2Version> = await dependencyBuilder.buildDependencyTree(dxPackage);
    let orderedPackages = this.getOrder(rootNode).reverse();
    if(this.flags.maxversion){
      const tempMap = new Map<Package2,Package2Version[]>();
      orderedPackages.forEach(element =>{
        if(tempMap.has(element.Package2)) tempMap.set(element.Package2, []);
        const versions = tempMap.get(element.Package2);
        versions.push(element);
      });
      const result: Package2Version[] = [];
      tempMap.forEach((v: Package2Version[], k: Package2) => {
        result.push(v.sort((v1, v2) => {
          return  v1.MajorVersion != v2.MajorVersion
                  ? v1.MajorVersion - v2.MajorVersion
                  : v1.MinorVersion != v2.MinorVersion
                    ? v1.MinorVersion - v2.MinorVersion
                    : v1.PatchVersion != v2.PatchVersion
                      ? v1.PatchVersion - v2.PatchVersion
                      : v1.BuildNumber - v2.BuildNumber
                      })[0]
                    );
      });
      orderedPackages = result;
    }
    orderedPackages.forEach(element => {
      const line: string =
        (this.flags.id      ? element.SubscriberPackageVersionId : '')
      + (this.flags.name    ? (':' + element.Package2.Name) : '')
      + (this.flags.version ? (':' + element.MajorVersion
                                    + '.' + element.MinorVersion
                                    + '.' + element.PatchVersion
                                    + '.' + element.BuildNumber) : '')
      + (this.flags.level   ? (':' + element.Package2.Name) : '')
      this.ux.log(line);
    });
    // Return an object to be displayed with --json
    return { dependency: 'tree'};
  }
  private getOrder(rootNode: DependencyTreeNode<Package2Version>){
    const result: Package2Version[] = [];
    result.push(rootNode.nodeElement);
    rootNode.children.forEach(node => {
      const nodeResult = this.getOrder(node)
      nodeResult.forEach(el => result.push(el));
    })
    return result;
  }
}
