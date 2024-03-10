import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  SearchParams,
  SearchResponse,
  ShowParams,
  ShowResponse,
  fileTypes,
  diskTypes,
} from "@models/searchParams";

export const searchAPi = createApi({
  reducerPath: "searchAPi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api",
  }),

  endpoints: (builder) => ({
    // TODO limit offset
    search: builder.mutation<SearchResponse, SearchParams>({
      query: (searchReq: SearchParams) => ({
        url: [`files/search?is_smart_search=${searchReq.smartSearch}`,
        `&query=${searchReq.query}`,
        `&disk=${searchReq.disk ? searchReq.disk : "all"}`,
        `&file_type=${searchReq.fileType ? searchReq.fileType : fileTypes.all}`,
        `&dir=${searchReq.dir ? searchReq.dir : ""}`,
        `&limit=${searchReq.limit ? searchReq.limit : 10}`,
        `&offset=${searchReq.offset ? searchReq.offset : 0}`].join(""),
        method: "GET",
      }),
    }),
    show: builder.mutation<ShowResponse, ShowParams>({
      query: (showReq: ShowParams) => ({
        url: [`/files?limit=${showReq.limit}`,
        `&offset=${showReq.offset}`,
        `${showReq.query ? `&query=${showReq.query}` : ""}`,
        `&disk=${showReq.disk ? showReq.disk : "all"}`,
        `&file_type=${showReq.fileType ? showReq.fileType.join(",") : fileTypes.all}`,
        `&dir=${showReq.dir && showReq.dir.length !== 0 ? showReq.dir : "all"}`].join(""),
        method: "GET",
      }),
    }),
  }),
});

export const { useSearchMutation, useShowMutation } = searchAPi;
