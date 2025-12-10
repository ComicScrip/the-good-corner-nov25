// @ts-nocheck
import { gql } from "@apollo/client";
import * as ApolloReactCommon from "@apollo/client/react";
import * as ApolloReactHooks from "@apollo/client/react";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTimeISO: { input: any; output: any };
};

export type Ad = {
  __typename?: "Ad";
  category: Category;
  createdAt: Scalars["DateTimeISO"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  location: Scalars["String"]["output"];
  pictureUrl: Scalars["String"]["output"];
  price: Scalars["Float"]["output"];
  tags: Array<Tag>;
  title: Scalars["String"]["output"];
};

export type Category = {
  __typename?: "Category";
  id: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  createAd: Ad;
  createCategory: Category;
  deleteAd: Scalars["String"]["output"];
  deleteCategory: Scalars["String"]["output"];
  updateAd: Ad;
  updateCategory: Category;
};

export type MutationCreateAdArgs = {
  data: NewAdInput;
};

export type MutationCreateCategoryArgs = {
  data: NewCategoryInput;
};

export type MutationDeleteAdArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteCategoryArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationUpdateAdArgs = {
  data: UpdateAdInput;
  id: Scalars["Int"]["input"];
};

export type MutationUpdateCategoryArgs = {
  data: UpdateCategoryInput;
  id: Scalars["Int"]["input"];
};

export type NewAdInput = {
  category: ObjectId;
  description: Scalars["String"]["input"];
  location: Scalars["String"]["input"];
  pictureUrl: Scalars["String"]["input"];
  price: Scalars["Float"]["input"];
  tags?: InputMaybe<Array<ObjectId>>;
  title: Scalars["String"]["input"];
};

export type NewCategoryInput = {
  name: Scalars["String"]["input"];
};

export type ObjectId = {
  id: Scalars["Int"]["input"];
};

export type Query = {
  __typename?: "Query";
  ad: Ad;
  ads: Array<Ad>;
  categories: Array<Category>;
  tags: Array<Tag>;
};

export type QueryAdArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryAdsArgs = {
  categoryId?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  order?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Scalars["String"]["input"]>;
  titleContains?: InputMaybe<Scalars["String"]["input"]>;
};

export type Tag = {
  __typename?: "Tag";
  id: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
};

export type UpdateAdInput = {
  category?: InputMaybe<ObjectId>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  pictureUrl?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  tags?: InputMaybe<Array<ObjectId>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateCategoryInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type CategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type CategoriesQuery = {
  __typename?: "Query";
  categories: Array<{ __typename?: "Category"; id: number; name: string }>;
};

export type CreateAdMutationVariables = Exact<{
  data: NewAdInput;
}>;

export type CreateAdMutation = {
  __typename?: "Mutation";
  createAd: { __typename?: "Ad"; id: number };
};

export type AdQueryVariables = Exact<{
  adId: Scalars["Int"]["input"];
}>;

export type AdQuery = {
  __typename?: "Query";
  ad: {
    __typename?: "Ad";
    id: number;
    title: string;
    price: number;
    description: string;
    createdAt: any;
    location: string;
    pictureUrl: string;
    category: { __typename?: "Category"; id: number; name: string };
    tags: Array<{ __typename?: "Tag"; id: number; name: string }>;
  };
};

export type RecentAdsQueryVariables = Exact<{ [key: string]: never }>;

export type RecentAdsQuery = {
  __typename?: "Query";
  ads: Array<{
    __typename?: "Ad";
    id: number;
    title: string;
    price: number;
    pictureUrl: string;
  }>;
};

export type TagsQueryVariables = Exact<{ [key: string]: never }>;

export type TagsQuery = {
  __typename?: "Query";
  tags: Array<{ __typename?: "Tag"; id: number; name: string }>;
};

export const CategoriesDocument = gql`
    query Categories {
  categories {
    id
    name
  }
}
    `;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCategoriesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    CategoriesQuery,
    CategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export function useCategoriesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    CategoriesQuery,
    CategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    CategoriesQuery,
    CategoriesQueryVariables
  >(CategoriesDocument, options);
}
export function useCategoriesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CategoriesQuery,
        CategoriesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    CategoriesQuery,
    CategoriesQueryVariables
  >(CategoriesDocument, options);
}
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<
  typeof useCategoriesLazyQuery
>;
export type CategoriesSuspenseQueryHookResult = ReturnType<
  typeof useCategoriesSuspenseQuery
>;
export type CategoriesQueryResult = ApolloReactCommon.QueryResult<
  CategoriesQuery,
  CategoriesQueryVariables
>;
export const CreateAdDocument = gql`
    mutation CreateAd($data: NewAdInput!) {
  createAd(data: $data) {
    id
  }
}
    `;
export type CreateAdMutationFn = ApolloReactCommon.MutationFunction<
  CreateAdMutation,
  CreateAdMutationVariables
>;

/**
 * __useCreateAdMutation__
 *
 * To run a mutation, you first call `useCreateAdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAdMutation, { data, loading, error }] = useCreateAdMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateAdMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateAdMutation,
    CreateAdMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateAdMutation,
    CreateAdMutationVariables
  >(CreateAdDocument, options);
}
export type CreateAdMutationHookResult = ReturnType<typeof useCreateAdMutation>;
export type CreateAdMutationResult =
  ApolloReactCommon.MutationResult<CreateAdMutation>;
export type CreateAdMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateAdMutation,
  CreateAdMutationVariables
>;
export const AdDocument = gql`
    query Ad($adId: Int!) {
  ad(id: $adId) {
    id
    title
    price
    description
    createdAt
    location
    category {
      id
      name
    }
    tags {
      id
      name
    }
    pictureUrl
  }
}
    `;

/**
 * __useAdQuery__
 *
 * To run a query within a React component, call `useAdQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdQuery({
 *   variables: {
 *      adId: // value for 'adId'
 *   },
 * });
 */
export function useAdQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<AdQuery, AdQueryVariables> &
    ({ variables: AdQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<AdQuery, AdQueryVariables>(
    AdDocument,
    options,
  );
}
export function useAdLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    AdQuery,
    AdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<AdQuery, AdQueryVariables>(
    AdDocument,
    options,
  );
}
export function useAdSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<AdQuery, AdQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<AdQuery, AdQueryVariables>(
    AdDocument,
    options,
  );
}
export type AdQueryHookResult = ReturnType<typeof useAdQuery>;
export type AdLazyQueryHookResult = ReturnType<typeof useAdLazyQuery>;
export type AdSuspenseQueryHookResult = ReturnType<typeof useAdSuspenseQuery>;
export type AdQueryResult = ApolloReactCommon.QueryResult<
  AdQuery,
  AdQueryVariables
>;
export const RecentAdsDocument = gql`
    query recentAds {
  ads {
    id
    title
    price
    pictureUrl
  }
}
    `;

/**
 * __useRecentAdsQuery__
 *
 * To run a query within a React component, call `useRecentAdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentAdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentAdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useRecentAdsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    RecentAdsQuery,
    RecentAdsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<RecentAdsQuery, RecentAdsQueryVariables>(
    RecentAdsDocument,
    options,
  );
}
export function useRecentAdsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    RecentAdsQuery,
    RecentAdsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<RecentAdsQuery, RecentAdsQueryVariables>(
    RecentAdsDocument,
    options,
  );
}
export function useRecentAdsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        RecentAdsQuery,
        RecentAdsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    RecentAdsQuery,
    RecentAdsQueryVariables
  >(RecentAdsDocument, options);
}
export type RecentAdsQueryHookResult = ReturnType<typeof useRecentAdsQuery>;
export type RecentAdsLazyQueryHookResult = ReturnType<
  typeof useRecentAdsLazyQuery
>;
export type RecentAdsSuspenseQueryHookResult = ReturnType<
  typeof useRecentAdsSuspenseQuery
>;
export type RecentAdsQueryResult = ApolloReactCommon.QueryResult<
  RecentAdsQuery,
  RecentAdsQueryVariables
>;
export const TagsDocument = gql`
    query Tags {
  tags {
    id
    name
  }
}
    `;

/**
 * __useTagsQuery__
 *
 * To run a query within a React component, call `useTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTagsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    TagsQuery,
    TagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<TagsQuery, TagsQueryVariables>(
    TagsDocument,
    options,
  );
}
export function useTagsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    TagsQuery,
    TagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<TagsQuery, TagsQueryVariables>(
    TagsDocument,
    options,
  );
}
export function useTagsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<TagsQuery, TagsQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<TagsQuery, TagsQueryVariables>(
    TagsDocument,
    options,
  );
}
export type TagsQueryHookResult = ReturnType<typeof useTagsQuery>;
export type TagsLazyQueryHookResult = ReturnType<typeof useTagsLazyQuery>;
export type TagsSuspenseQueryHookResult = ReturnType<
  typeof useTagsSuspenseQuery
>;
export type TagsQueryResult = ApolloReactCommon.QueryResult<
  TagsQuery,
  TagsQueryVariables
>;
