import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';

describe('displays dependencies from the project json file', () => {
    const projectJson = {
        packageDirectories: [
            {
                package: 'Test Package',
                dependencies: [
                    {package: 'A', versionNumber: '1.0.0.LATEST'},
                    {package: 'B', versionNumber: '2.0.0.LATEST'}
                ]
            }
        ]
    };
    test
        .withProject(ensureJsonMap(projectJson))
        .withOrg({username: 'test@mail.db.com', isDevHub: true}, true)
        .stdout()
        .command(['dependency:project:tree', '--targetusername', 'test@mail.db.com'])
        .it('', ctx => {
            expect(ctx.stdout).to.contain('+- A');
            expect(ctx.stdout).to.contain('\\- B');
        });
});

describe('includes dependencies versions in the output given withversion flag', () => {
    const projectJson = {
        packageDirectories: [
            {
                package: 'Test Package',
                dependencies: [
                    {package: 'A', versionNumber: '1.0.0.3'},
                    {package: 'B', versionNumber: '2.0.0.4'}
                ]
            }
        ]
    };
    test
        .withProject(ensureJsonMap(projectJson))
        .withOrg({username: 'test@mail.db.com', isDevHub: true}, true)
        .stdout()
        .command(['dependency:project:tree', '--targetusername', 'test@mail.db.com', '--withversion'])
        .it('', ctx => {
            expect(ctx.stdout).to.contain('+- A:1.0.0.3');
            expect(ctx.stdout).to.contain('\\- B:2.0.0.4');
        });
});

describe('resolves "LATEST" placeholder given withversion flag', () => {
    const projectJson = {
        packageDirectories: [
            {
                package: 'Test Package',
                dependencies: [
                    {package: 'A', versionNumber: '1.0.0.LATEST'}
                ]
            }
        ],
        packageAliases: {
            ['A']: '04H123'
        }
    };
    test
        .withProject(ensureJsonMap(projectJson))
        .withOrg({username: 'test@mail.db.com', isDevHub: true}, true)
        .withConnectionRequest(request => {
            const requestMap = ensureJsonMap(request);
            if (ensureString(requestMap.url).match('max')) {
              return Promise.resolve({ records: [ { latestbuildnumber: 3}] });
            }
            return Promise.resolve({ records: [ {Package2: {Name: 'A'}, MajorVersion: '1', MinorVersion: '0', PatchVersion: '0', BuildNumber: '3' } ]});
          })
        .stdout()
        .command(['dependency:project:tree', '--targetusername', 'test@mail.db.com', '--withversion'])
        .it('', ctx => {
            expect(ctx.stdout).to.contain('\\- A:1.0.0.3');
        });
});
