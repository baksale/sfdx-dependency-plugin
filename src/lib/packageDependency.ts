import { Connection } from '@salesforce/core';
import {EntityDependencyApi} from 'any-dependency-tree/dist/index';
import { Package2Version } from 'dx-package-api/lib/main';
import { DxPackageMetadataApi  } from 'dx-package-api/lib/main/api';
import { DxPackageMetadataApiImpl } from 'dx-package-api/lib/main/apimpl';
import { DxPackageMetadataCachingApi, DxPackageMetadataCachingApiImpl } from 'dx-package-api/lib/main/cachingapi';

export class PackageDependencyApi implements EntityDependencyApi<Package2Version> {
    private cachingApi: DxPackageMetadataCachingApi;
    private api: DxPackageMetadataApi;
    constructor(connection: Connection) {
        this.api = new DxPackageMetadataApiImpl(connection);
        this.cachingApi = new DxPackageMetadataCachingApiImpl(connection);
    }

    public async getPackagesByIds(packageIds: string[]): Promise<Package2Version[]> {
        return await this.api.getPackage2VersionByIds(packageIds);
    }

    public async getEntityDependencies(entity: Package2Version): Promise<Package2Version[]> {
        return await this.cachingApi.getDependencies(entity.SubscriberPackageVersionId);
    }
    public async getLatestPackageVersion(package2Id: string, majorVersion: string, minorVersion: string, patchVersion: string): Promise<Package2Version> {
        const buildNumber = await this.api.getMaxBuildNumber(package2Id, majorVersion, minorVersion, patchVersion);
        return this.api.getPackage2VersionByVersion(package2Id, majorVersion, minorVersion, patchVersion, '' + buildNumber);
    }
    public async getPackageVersion(package2Id: string, majorVersion: string, minorVersion: string, patchVersion: string, buildNumber: string): Promise<Package2Version> {
        return this.api.getPackage2VersionByVersion(package2Id, majorVersion, minorVersion, patchVersion, buildNumber);
    }
}
