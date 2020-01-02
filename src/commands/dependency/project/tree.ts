import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson, JsonMap } from '@salesforce/ts-types';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { SerializingVisitor } from 'any-dependency-tree/dist/visitor/serializing';
import { DxPackageSerializer } from '../../../lib/dxPackageSerializer';
import { Package2, Package2Version } from '../../../lib/model';
import { PackageDependencyApi } from '../../../lib/packageDependency';
import { PackageDirectoryDependency, SfdxProjectModel } from '../../../lib/projectModel';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-dependency-plugin', 'org');

export default class Tree extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-p, --package=VALUE)
    withversion: flags.boolean({description: messages.getMessage('packageVersionDescription'), default: false})
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
    for (const dependency of dependencies) {
      const versionElements: string[] = dependency.versionNumber.split('\.', 4);
      if ('LATEST' === versionElements[3]) {
        const childElement: Package2Version = await dependencyApi.getLatestPackageVersion(project.packageAliases[dependency.package], versionElements[0], versionElements[1], versionElements[2]);
        // tslint:disable-next-line: no-unused-expression
        new DependencyTreeNode(childElement, rootNode);
      } else {
        const childElement: Package2Version = {Package2: {Name: dependency.package},
          MajorVersion: Number.parseInt(versionElements[0], 10),
          MinorVersion: Number.parseInt(versionElements[1], 10),
          PatchVersion: Number.parseInt(versionElements[2], 10),
          BuildNumber: Number.parseInt(versionElements[3], 10)};
        // tslint:disable-next-line: no-unused-expression
        new DependencyTreeNode(childElement, rootNode);
      }
    }
    const serializer = new DxPackageSerializer(this.flags.withversion, false);
    const visitor: SerializingVisitor = new SerializingVisitor(serializer);
    this.ux.log(visitor.visitTree(rootNode));
    return 'empty';
  }
}
