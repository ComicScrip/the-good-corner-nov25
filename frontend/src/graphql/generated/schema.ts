// @ts-nocheck
import { gql } from "@apollo/client";
import type * as ApolloReactCommon from "@apollo/client/react";
import * as ApolloReactHooks from "@apollo/client/react";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
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
  author: User;
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

export type LoginInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  createAd: Ad;
  createCategory: Category;
  createTag: Tag;
  deleteAd: Scalars["String"]["output"];
  deleteCategory: Scalars["String"]["output"];
  deleteTag: Scalars["Boolean"]["output"];
  login: Scalars["String"]["output"];
  logout: Scalars["Boolean"]["output"];
  signup: User;
  updateAd: Ad;
  updateCategory: Category;
  updateTag: Tag;
};

export type MutationCreateAdArgs = {
  data: NewAdInput;
};

export type MutationCreateCategoryArgs = {
  data: NewCategoryInput;
};

export type MutationCreateTagArgs = {
  data: NewTagInput;
};

export type MutationDeleteAdArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteCategoryArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteTagArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationLoginArgs = {
  data: LoginInput;
};

export type MutationSignupArgs = {
  data: SignupInput;
};

export type MutationUpdateAdArgs = {
  data: UpdateAdInput;
  id: Scalars["Int"]["input"];
};

export type MutationUpdateCategoryArgs = {
  data: UpdateCategoryInput;
  id: Scalars["Int"]["input"];
};

export type MutationUpdateTagArgs = {
  data: UpdateTagInput;
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

export type NewTagInput = {
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
  me?: Maybe<User>;
  tags: Array<Tag>;
  users: Array<User>;
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

export type SignupInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
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

export type UpdateTagInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  __typename?: "User";
  createdAt: Scalars["DateTimeISO"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  role: Scalars["String"]["output"];
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

export type CreateCategoryMutationVariables = Exact<{
  data: NewCategoryInput;
}>;

export type CreateCategoryMutation = {
  __typename?: "Mutation";
  createCategory: { __typename?: "Category"; id: number; name: string };
};

export type CreateTagMutationVariables = Exact<{
  data: NewTagInput;
}>;

export type CreateTagMutation = {
  __typename?: "Mutation";
  createTag: { __typename?: "Tag"; id: number; name: string };
};

export type DeleteAdMutationVariables = Exact<{
  deleteAdId: Scalars["Int"]["input"];
}>;

export type DeleteAdMutation = { __typename?: "Mutation"; deleteAd: string };

export type DeleteCategoryMutationVariables = Exact<{
  deleteCategoryId: Scalars["Int"]["input"];
}>;

export type DeleteCategoryMutation = { __typename?: "Mutation"; deleteCategory: string };

export type DeleteTagMutationVariables = Exact<{
  deleteTagId: Scalars["Int"]["input"];
}>;

export type DeleteTagMutation = { __typename?: "Mutation"; deleteTag: boolean };

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
    author: { __typename?: "User"; id: number };
  };
};

export type LoginMutationVariables = Exact<{
  data: LoginInput;
}>;

export type LoginMutation = { __typename?: "Mutation"; login: string };

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: "Mutation"; logout: boolean };

export type ProfileQueryVariables = Exact<{ [key: string]: never }>;

export type ProfileQuery = {
  __typename?: "Query";
  me?: { __typename?: "User"; id: number; email: string; createdAt: any; role: string } | null;
};

export type RecentAdsQueryVariables = Exact<{ [key: string]: never }>;

export type RecentAdsQuery = {
  __typename?: "Query";
  ads: Array<{ __typename?: "Ad"; id: number; title: string; price: number; pictureUrl: string }>;
};

export type SearchAdsQueryVariables = Exact<{
  titleContains?: InputMaybe<Scalars["String"]["input"]>;
  categoryId?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Scalars["String"]["input"]>;
  order?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SearchAdsQuery = {
  __typename?: "Query";
  ads: Array<{
    __typename?: "Ad";
    id: number;
    title: string;
    price: number;
    pictureUrl: string;
    location: string;
  }>;
};

export type SignupMutationVariables = Exact<{
  data: SignupInput;
}>;

export type SignupMutation = {
  __typename?: "Mutation";
  signup: { __typename?: "User"; id: number; email: string; createdAt: any };
};

export type TagsQueryVariables = Exact<{ [key: string]: never }>;

export type TagsQuery = {
  __typename?: "Query";
  tags: Array<{ __typename?: "Tag"; id: number; name: string }>;
};

export type UpdateAdMutationVariables = Exact<{
  updateAdId: Scalars["Int"]["input"];
  data: UpdateAdInput;
}>;

export type UpdateAdMutation = {
  __typename?: "Mutation";
  updateAd: {
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

export type UpdateCategoryMutationVariables = Exact<{
  updateCategoryId: Scalars["Int"]["input"];
  data: UpdateCategoryInput;
}>;

export type UpdateCategoryMutation = {
  __typename?: "Mutation";
  updateCategory: { __typename?: "Category"; id: number; name: string };
};

export type UpdateTagMutationVariables = Exact<{
  updateTagId: Scalars["Int"]["input"];
  data: UpdateTagInput;
}>;

export type UpdateTagMutation = {
  __typename?: "Mutation";
  updateTag: { __typename?: "Tag"; id: number; name: string };
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
  baseOptions?: ApolloReactHooks.QueryHookOptions<CategoriesQuery, CategoriesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export function useCategoriesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export function useCategoriesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesSuspenseQueryHookResult = ReturnType<typeof useCategoriesSuspenseQuery>;
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
  baseOptions?: ApolloReactHooks.MutationHookOptions<CreateAdMutation, CreateAdMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<CreateAdMutation, CreateAdMutationVariables>(
    CreateAdDocument,
    options,
  );
}
export type CreateAdMutationHookResult = ReturnType<typeof useCreateAdMutation>;
export type CreateAdMutationResult = ApolloReactCommon.MutationResult<CreateAdMutation>;
export type CreateAdMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateAdMutation,
  CreateAdMutationVariables
>;
export const CreateCategoryDocument = gql`
    mutation CreateCategory($data: NewCategoryInput!) {
  createCategory(data: $data) {
    id
    name
  }
}
    `;
export type CreateCategoryMutationFn = ApolloReactCommon.MutationFunction<
  CreateCategoryMutation,
  CreateCategoryMutationVariables
>;

/**
 * __useCreateCategoryMutation__
 *
 * To run a mutation, you first call `useCreateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCategoryMutation, { data, loading, error }] = useCreateCategoryMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateCategoryMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateCategoryMutation,
    CreateCategoryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(
    CreateCategoryDocument,
    options,
  );
}
export type CreateCategoryMutationHookResult = ReturnType<typeof useCreateCategoryMutation>;
export type CreateCategoryMutationResult = ApolloReactCommon.MutationResult<CreateCategoryMutation>;
export type CreateCategoryMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateCategoryMutation,
  CreateCategoryMutationVariables
>;
export const CreateTagDocument = gql`
    mutation CreateTag($data: NewTagInput!) {
  createTag(data: $data) {
    id
    name
  }
}
    `;
export type CreateTagMutationFn = ApolloReactCommon.MutationFunction<
  CreateTagMutation,
  CreateTagMutationVariables
>;

/**
 * __useCreateTagMutation__
 *
 * To run a mutation, you first call `useCreateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagMutation, { data, loading, error }] = useCreateTagMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateTagMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<CreateTagMutation, CreateTagMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<CreateTagMutation, CreateTagMutationVariables>(
    CreateTagDocument,
    options,
  );
}
export type CreateTagMutationHookResult = ReturnType<typeof useCreateTagMutation>;
export type CreateTagMutationResult = ApolloReactCommon.MutationResult<CreateTagMutation>;
export type CreateTagMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateTagMutation,
  CreateTagMutationVariables
>;
export const DeleteAdDocument = gql`
    mutation DeleteAd($deleteAdId: Int!) {
  deleteAd(id: $deleteAdId)
}
    `;
export type DeleteAdMutationFn = ApolloReactCommon.MutationFunction<
  DeleteAdMutation,
  DeleteAdMutationVariables
>;

/**
 * __useDeleteAdMutation__
 *
 * To run a mutation, you first call `useDeleteAdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAdMutation, { data, loading, error }] = useDeleteAdMutation({
 *   variables: {
 *      deleteAdId: // value for 'deleteAdId'
 *   },
 * });
 */
export function useDeleteAdMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteAdMutation, DeleteAdMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<DeleteAdMutation, DeleteAdMutationVariables>(
    DeleteAdDocument,
    options,
  );
}
export type DeleteAdMutationHookResult = ReturnType<typeof useDeleteAdMutation>;
export type DeleteAdMutationResult = ApolloReactCommon.MutationResult<DeleteAdMutation>;
export type DeleteAdMutationOptions = ApolloReactCommon.BaseMutationOptions<
  DeleteAdMutation,
  DeleteAdMutationVariables
>;
export const DeleteCategoryDocument = gql`
    mutation deleteCategory($deleteCategoryId: Int!) {
  deleteCategory(id: $deleteCategoryId)
}
    `;
export type DeleteCategoryMutationFn = ApolloReactCommon.MutationFunction<
  DeleteCategoryMutation,
  DeleteCategoryMutationVariables
>;

/**
 * __useDeleteCategoryMutation__
 *
 * To run a mutation, you first call `useDeleteCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCategoryMutation, { data, loading, error }] = useDeleteCategoryMutation({
 *   variables: {
 *      deleteCategoryId: // value for 'deleteCategoryId'
 *   },
 * });
 */
export function useDeleteCategoryMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteCategoryMutation,
    DeleteCategoryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<DeleteCategoryMutation, DeleteCategoryMutationVariables>(
    DeleteCategoryDocument,
    options,
  );
}
export type DeleteCategoryMutationHookResult = ReturnType<typeof useDeleteCategoryMutation>;
export type DeleteCategoryMutationResult = ApolloReactCommon.MutationResult<DeleteCategoryMutation>;
export type DeleteCategoryMutationOptions = ApolloReactCommon.BaseMutationOptions<
  DeleteCategoryMutation,
  DeleteCategoryMutationVariables
>;
export const DeleteTagDocument = gql`
    mutation deleteTag($deleteTagId: Int!) {
  deleteTag(id: $deleteTagId)
}
    `;
export type DeleteTagMutationFn = ApolloReactCommon.MutationFunction<
  DeleteTagMutation,
  DeleteTagMutationVariables
>;

/**
 * __useDeleteTagMutation__
 *
 * To run a mutation, you first call `useDeleteTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTagMutation, { data, loading, error }] = useDeleteTagMutation({
 *   variables: {
 *      deleteTagId: // value for 'deleteTagId'
 *   },
 * });
 */
export function useDeleteTagMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteTagMutation, DeleteTagMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(
    DeleteTagDocument,
    options,
  );
}
export type DeleteTagMutationHookResult = ReturnType<typeof useDeleteTagMutation>;
export type DeleteTagMutationResult = ApolloReactCommon.MutationResult<DeleteTagMutation>;
export type DeleteTagMutationOptions = ApolloReactCommon.BaseMutationOptions<
  DeleteTagMutation,
  DeleteTagMutationVariables
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
    author {
      id
    }
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
  return ApolloReactHooks.useQuery<AdQuery, AdQueryVariables>(AdDocument, options);
}
export function useAdLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AdQuery, AdQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<AdQuery, AdQueryVariables>(AdDocument, options);
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
  return ApolloReactHooks.useSuspenseQuery<AdQuery, AdQueryVariables>(AdDocument, options);
}
export type AdQueryHookResult = ReturnType<typeof useAdQuery>;
export type AdLazyQueryHookResult = ReturnType<typeof useAdLazyQuery>;
export type AdSuspenseQueryHookResult = ReturnType<typeof useAdSuspenseQuery>;
export type AdQueryResult = ApolloReactCommon.QueryResult<AdQuery, AdQueryVariables>;
export const LoginDocument = gql`
    mutation Login($data: LoginInput!) {
  login(data: $data)
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<
  LoginMutation,
  LoginMutationVariables
>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLoginMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    options,
  );
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = ApolloReactCommon.MutationFunction<
  LogoutMutation,
  LogoutMutationVariables
>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(
    LogoutDocument,
    options,
  );
}
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = ApolloReactCommon.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = ApolloReactCommon.BaseMutationOptions<
  LogoutMutation,
  LogoutMutationVariables
>;
export const ProfileDocument = gql`
    query profile {
  me {
    id
    email
    createdAt
    role
  }
}
    `;

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<ProfileQuery, ProfileQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
}
export function useProfileLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<ProfileQuery, ProfileQueryVariables>(
    ProfileDocument,
    options,
  );
}
export function useProfileSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(
    ProfileDocument,
    options,
  );
}
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileSuspenseQueryHookResult = ReturnType<typeof useProfileSuspenseQuery>;
export type ProfileQueryResult = ApolloReactCommon.QueryResult<ProfileQuery, ProfileQueryVariables>;
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
  baseOptions?: ApolloReactHooks.QueryHookOptions<RecentAdsQuery, RecentAdsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<RecentAdsQuery, RecentAdsQueryVariables>(
    RecentAdsDocument,
    options,
  );
}
export function useRecentAdsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RecentAdsQuery, RecentAdsQueryVariables>,
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
    | ApolloReactHooks.SuspenseQueryHookOptions<RecentAdsQuery, RecentAdsQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<RecentAdsQuery, RecentAdsQueryVariables>(
    RecentAdsDocument,
    options,
  );
}
export type RecentAdsQueryHookResult = ReturnType<typeof useRecentAdsQuery>;
export type RecentAdsLazyQueryHookResult = ReturnType<typeof useRecentAdsLazyQuery>;
export type RecentAdsSuspenseQueryHookResult = ReturnType<typeof useRecentAdsSuspenseQuery>;
export type RecentAdsQueryResult = ApolloReactCommon.QueryResult<
  RecentAdsQuery,
  RecentAdsQueryVariables
>;
export const SearchAdsDocument = gql`
    query SearchAds($titleContains: String, $categoryId: Int, $limit: Int, $sortBy: String, $order: String) {
  ads(
    titleContains: $titleContains
    categoryId: $categoryId
    limit: $limit
    sortBy: $sortBy
    order: $order
  ) {
    id
    title
    price
    pictureUrl
    location
  }
}
    `;

/**
 * __useSearchAdsQuery__
 *
 * To run a query within a React component, call `useSearchAdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchAdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchAdsQuery({
 *   variables: {
 *      titleContains: // value for 'titleContains'
 *      categoryId: // value for 'categoryId'
 *      limit: // value for 'limit'
 *      sortBy: // value for 'sortBy'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useSearchAdsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<SearchAdsQuery, SearchAdsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<SearchAdsQuery, SearchAdsQueryVariables>(
    SearchAdsDocument,
    options,
  );
}
export function useSearchAdsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchAdsQuery, SearchAdsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<SearchAdsQuery, SearchAdsQueryVariables>(
    SearchAdsDocument,
    options,
  );
}
export function useSearchAdsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<SearchAdsQuery, SearchAdsQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<SearchAdsQuery, SearchAdsQueryVariables>(
    SearchAdsDocument,
    options,
  );
}
export type SearchAdsQueryHookResult = ReturnType<typeof useSearchAdsQuery>;
export type SearchAdsLazyQueryHookResult = ReturnType<typeof useSearchAdsLazyQuery>;
export type SearchAdsSuspenseQueryHookResult = ReturnType<typeof useSearchAdsSuspenseQuery>;
export type SearchAdsQueryResult = ApolloReactCommon.QueryResult<
  SearchAdsQuery,
  SearchAdsQueryVariables
>;
export const SignupDocument = gql`
    mutation Signup($data: SignupInput!) {
  signup(data: $data) {
    id
    email
    createdAt
  }
}
    `;
export type SignupMutationFn = ApolloReactCommon.MutationFunction<
  SignupMutation,
  SignupMutationVariables
>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSignupMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<SignupMutation, SignupMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<SignupMutation, SignupMutationVariables>(
    SignupDocument,
    options,
  );
}
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = ApolloReactCommon.MutationResult<SignupMutation>;
export type SignupMutationOptions = ApolloReactCommon.BaseMutationOptions<
  SignupMutation,
  SignupMutationVariables
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
  baseOptions?: ApolloReactHooks.QueryHookOptions<TagsQuery, TagsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
}
export function useTagsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<TagsQuery, TagsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
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
  return ApolloReactHooks.useSuspenseQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
}
export type TagsQueryHookResult = ReturnType<typeof useTagsQuery>;
export type TagsLazyQueryHookResult = ReturnType<typeof useTagsLazyQuery>;
export type TagsSuspenseQueryHookResult = ReturnType<typeof useTagsSuspenseQuery>;
export type TagsQueryResult = ApolloReactCommon.QueryResult<TagsQuery, TagsQueryVariables>;
export const UpdateAdDocument = gql`
    mutation UpdateAd($updateAdId: Int!, $data: UpdateAdInput!) {
  updateAd(id: $updateAdId, data: $data) {
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
export type UpdateAdMutationFn = ApolloReactCommon.MutationFunction<
  UpdateAdMutation,
  UpdateAdMutationVariables
>;

/**
 * __useUpdateAdMutation__
 *
 * To run a mutation, you first call `useUpdateAdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAdMutation, { data, loading, error }] = useUpdateAdMutation({
 *   variables: {
 *      updateAdId: // value for 'updateAdId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateAdMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateAdMutation, UpdateAdMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<UpdateAdMutation, UpdateAdMutationVariables>(
    UpdateAdDocument,
    options,
  );
}
export type UpdateAdMutationHookResult = ReturnType<typeof useUpdateAdMutation>;
export type UpdateAdMutationResult = ApolloReactCommon.MutationResult<UpdateAdMutation>;
export type UpdateAdMutationOptions = ApolloReactCommon.BaseMutationOptions<
  UpdateAdMutation,
  UpdateAdMutationVariables
>;
export const UpdateCategoryDocument = gql`
    mutation updateCategory($updateCategoryId: Int!, $data: UpdateCategoryInput!) {
  updateCategory(id: $updateCategoryId, data: $data) {
    id
    name
  }
}
    `;
export type UpdateCategoryMutationFn = ApolloReactCommon.MutationFunction<
  UpdateCategoryMutation,
  UpdateCategoryMutationVariables
>;

/**
 * __useUpdateCategoryMutation__
 *
 * To run a mutation, you first call `useUpdateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCategoryMutation, { data, loading, error }] = useUpdateCategoryMutation({
 *   variables: {
 *      updateCategoryId: // value for 'updateCategoryId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateCategoryMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateCategoryMutation,
    UpdateCategoryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<UpdateCategoryMutation, UpdateCategoryMutationVariables>(
    UpdateCategoryDocument,
    options,
  );
}
export type UpdateCategoryMutationHookResult = ReturnType<typeof useUpdateCategoryMutation>;
export type UpdateCategoryMutationResult = ApolloReactCommon.MutationResult<UpdateCategoryMutation>;
export type UpdateCategoryMutationOptions = ApolloReactCommon.BaseMutationOptions<
  UpdateCategoryMutation,
  UpdateCategoryMutationVariables
>;
export const UpdateTagDocument = gql`
    mutation updateTag($updateTagId: Int!, $data: UpdateTagInput!) {
  updateTag(id: $updateTagId, data: $data) {
    id
    name
  }
}
    `;
export type UpdateTagMutationFn = ApolloReactCommon.MutationFunction<
  UpdateTagMutation,
  UpdateTagMutationVariables
>;

/**
 * __useUpdateTagMutation__
 *
 * To run a mutation, you first call `useUpdateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTagMutation, { data, loading, error }] = useUpdateTagMutation({
 *   variables: {
 *      updateTagId: // value for 'updateTagId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateTagMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateTagMutation, UpdateTagMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<UpdateTagMutation, UpdateTagMutationVariables>(
    UpdateTagDocument,
    options,
  );
}
export type UpdateTagMutationHookResult = ReturnType<typeof useUpdateTagMutation>;
export type UpdateTagMutationResult = ApolloReactCommon.MutationResult<UpdateTagMutation>;
export type UpdateTagMutationOptions = ApolloReactCommon.BaseMutationOptions<
  UpdateTagMutation,
  UpdateTagMutationVariables
>;
