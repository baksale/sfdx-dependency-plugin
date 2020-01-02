import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap } from '@salesforce/ts-types';

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
        .stdout()
        .command(['dependency:project:tree'])
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
