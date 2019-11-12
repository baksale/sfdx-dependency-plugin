import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { PackageDependencyApi } from '../../lib/packageDependency';
import { DependencyTreeBuilder } from 'any-dependency-tree/dist';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Package2Version } from '../../lib/model';
import { DependencyTreeVisitor } from 'any-dependency-tree/dist/dependencyTreeVisitor';
import { DxPackageSerializer } from '../../lib/dxPackageSerializer';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-dependency-plugin', 'org');

export default class Tree extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx sdlc:dependency:tree --targetdevhubusername devhub@org.com --package '04t0..'
  Main Package:0
  +- 1st Level Pacakge 1:A
  |  +- 2nd Level Package 1:C
  |  +- 2nd Level Package 2:D
  |  |  \\- 3rd Level Package only:F
  |  \\- 2nd Level Package last:E
  \\- 1st Level Pacakge 2:B
  `,
  `$ sfdx sdlc:dependency:tree -p '04tA..'
  1st Level Pacakge 1:A
  +- 2nd Level Package 1:C
  +- 2nd Level Package 2:D
  |  \\- 3rd Level Package only:F
  \\- 2nd Level Package last:E
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-p, --package=VALUE)
    package: flags.string({char: 'p', description: messages.getMessage('packageFlagDescription')}),
    major: flags.boolean({char: 'j', description: messages.getMessage('majorFlagDescription')}),
    minor: flags.boolean({char: 'r', description: messages.getMessage('minorFlagDescription')}),
    patch: flags.boolean({char: 'h', description: messages.getMessage('patchFlagDescription')}),
    build: flags.boolean({char: 'b', description: messages.getMessage('buildFlagDescription')}),
    name: flags.boolean({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    version: flags.boolean({char: 'v', description: messages.getMessage('versionFlagDescription')})
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
    const visitor: DependencyTreeVisitor = new DependencyTreeVisitor();
    visitor.serializer = new DxPackageSerializer();
    this.ux.log(visitor.visitTree(rootNode));
    // Return an object to be displayed with --json
    return { dependency: 'tree'};
  }
}
