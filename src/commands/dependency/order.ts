import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { DependencyTreeBuilder } from 'any-dependency-tree/dist';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Ordering } from 'any-dependency-tree/dist/visitor/ordering';
import { Package2Version } from '../../lib/model';
import { PackageDependencyApi } from '../../lib/packageDependency';

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
    name: flags.boolean({char: 'n', description: messages.getMessage('nameFlagDescription'), default: false}),
    version: flags.boolean({description: messages.getMessage('packageVersionDescription'), default: false}),
    maxversion: flags.boolean({char: 'x', description: messages.getMessage('maxVersionFlagDescription'), default: false}),
    withrootpackage: flags.boolean({char: 'w', description: messages.getMessage('withRootPackageFlagDescription'), default: false})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static requiresDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    let packageId: string = this.flags.package;
    if (packageId == null) { return {errorMessage: messages.getMessage('errorNoPackageProvided')}; }
    packageId = packageId.replace('\'', '').replace('\'', '');
    const dependencyApi = new PackageDependencyApi(this.hubOrg.getConnection());
    const dependencyBuilder = new DependencyTreeBuilder<Package2Version>(dependencyApi);
    const dxPackages: Package2Version[] = await dependencyApi.getPackagesByIds([packageId]);
    const dxPackage: Package2Version = dxPackages[0];
    const rootNode: DependencyTreeNode<Package2Version> = await dependencyBuilder.buildDependencyTree(dxPackage);
    const ordering: Ordering = new Ordering(this.flags.withrootpackage);
    let orderedPackages = ordering.visitTree(rootNode);
    if (this.flags.maxversion) {
      const tempMap = new Map<string, Array<DependencyTreeNode<Package2Version>>>();
      orderedPackages.forEach(element => {
        if (!tempMap.has(element.nodeElement.Package2.Name)) tempMap.set(element.nodeElement.Package2.Name, []);
        const versions = tempMap.get(element.nodeElement.Package2.Name);
        versions.push(element);
      });
      const result: Array<DependencyTreeNode<Package2Version>> = [];
      tempMap.forEach((v: Array<DependencyTreeNode<Package2Version>>, k: string) => {
        result.push(v.sort((v2, v1) => {
          return  v1.nodeElement.MajorVersion !== v2.nodeElement.MajorVersion
                  ? v1.nodeElement.MajorVersion - v2.nodeElement.MajorVersion
                  : v1.nodeElement.MinorVersion !== v2.nodeElement.MinorVersion
                    ? v1.nodeElement.MinorVersion - v2.nodeElement.MinorVersion
                    : v1.nodeElement.PatchVersion !== v2.nodeElement.PatchVersion
                      ? v1.nodeElement.PatchVersion - v2.nodeElement.PatchVersion
                      : v1.nodeElement.BuildNumber - v2.nodeElement.BuildNumber;
                      })[0]
                    );
      });
      orderedPackages = result;
    }
    orderedPackages.forEach(element => {
      const line: string = element.nodeElement.SubscriberPackageVersionId
      + (this.flags.name    ? (':' + element.nodeElement.Package2.Name) : '')
      + (this.flags.version ? (':' + element.nodeElement.MajorVersion
                                    + '.' + element.nodeElement.MinorVersion
                                    + '.' + element.nodeElement.PatchVersion
                                    + '.' + element.nodeElement.BuildNumber) : '');
      this.ux.log(line);
    });
    // Return an object to be displayed with --json
    return { dependency: 'order'};
  }
}
