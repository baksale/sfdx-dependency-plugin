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
        .withOrg({username: 'test@mail.db.com', devHubUsername: 'test@mail.db.com', isDevHub: true}, true)
        .withConnectionRequest(request => {
            const requestMap = ensureJsonMap(request);
            if (ensureString(requestMap.url).match(/Organization/)) {
              return Promise.resolve({ records: [ { Name: 'Super Awesome Org', TrialExpirationDate: '2018-03-20T23:24:11.000+0000'}] });
            }
            return Promise.resolve({ records: [] });
          })
        .stdout()
        .command(['dependency:project:tree', '--targetdevhubusername', 'test@mail.db.com'])
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
        .stdout()
        .command(['dependency:project:tree', '--withversion'])
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
        ]
    };
    test
        .withProject(ensureJsonMap(projectJson))
        .stdout()
        .command(['dependency:project:tree', '--withversion'])
        .it('', ctx => {
            expect(ctx.stdout).to.contain('+- A:1.0.0.3');
        });
});
