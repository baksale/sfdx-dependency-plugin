export interface SubscriberPackageVersion {
    attributes: Attributes;
    Dependencies: Dependencies;
}

export interface Dependencies {
    ids: Id[];
}

export interface Id {
    subscriberPackageVersionId: string;
}

export interface Attributes {
    type: string;
    url: string;
}

export interface Package2Version {
    attributes?: Attributes;
    Id?: string;
    Package2Id?: string;
    SubscriberPackageVersionId?: string;
    Name?: string;
    Package2: Package2;
    Description? : string;
    Tag?: string;
    Branch?: string;
    MajorVersion?: number;
    MinorVersion?: number;
    PatchVersion?: number;
    BuildNumber?: number;
    IsRelease?: boolean;
    CreatedDate?: string;
    LasteModifiedDate?: string;
    IsPasswordProtected?: boolean;
}

export interface Package2 {
    attributes?: Attributes;
    Name: string;
    NamespacePrefix?: string;
}
