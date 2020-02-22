import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson, JsonMap } from '@salesforce/ts-types';
import { DependencyTreeBuilder } from 'any-dependency-tree/dist';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { OrderingVisitor } from 'any-dependency-tree/dist/visitor/ordering';
import { Package2, Package2Version } from 'dx-package-api/lib/main';
import { PackageDependencyApi } from '../../../lib/packageDependency';
import { PackageDirectoryDependency, SfdxProjectModel } from '../../../lib/projectModel';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-dependency-plugin', 'org');

export default class Order extends SfdxCommand {

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
    name: flags.boolean({char: 'n', description: messages.getMessage('nameFlagDescription'), default: false}),
    withrootpackage: flags.boolean({char: 'w', description: messages.getMessage('withRootPackageFlagDescription'), default: false}),
    version: flags.boolean({description: messages.getMessage('packageVersionDescription'), default: false}),
    maxversion: flags.boolean({char: 'x', description: messages.getMessage('maxVersionFlagDescription'), default: false})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static requiresDevhubUsername = false;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const dependencyApi = new PackageDependencyApi(this.hubOrg.getConnection());
    const projectJson: JsonMap = await this.project.resolveProjectConfig();
    const project: SfdxProjectModel = JSON.parse(JSON.stringify(projectJson));
    const dependencies: PackageDirectoryDependency[] = project.packageDirectories[0].dependencies;
    const rootPackage: Package2 = {Name: project.packageDirectories[0].package};
    const rootElement: Package2Version = {Package2: rootPackage};
    const rootNode: DependencyTreeNode<Package2Version> = new DependencyTreeNode(rootElement);
    const builder = new DependencyTreeBuilder<Package2Version>(dependencyApi);
    if (dependencies) {
      for (const dependency of dependencies) {
        const versionElements: string[] = dependency.versionNumber.split('\.', 4);
        if ('LATEST' === versionElements[3]) {
          const childElement: Package2Version = await dependencyApi.getLatestPackageVersion(project.packageAliases[dependency.package], versionElements[0], versionElements[1], versionElements[2]);
          rootNode.extendWithSubTree(await builder.buildDependencyTree(childElement));
        } else {
          const childElement: Package2Version = await dependencyApi.getPackageVersion(project.packageAliases[dependency.package], versionElements[0], versionElements[1], versionElements[2], versionElements[3]);
          rootNode.extendWithSubTree(await builder.buildDependencyTree(childElement));
        }
      }
    }
    const ordering: OrderingVisitor = new OrderingVisitor(false);
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
