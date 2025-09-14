import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import searchService from "../services/search.service.api";
import type {
  SearchRequest,
  SearchResponse,
  UseSearchPlacesOptions,
} from "../types/search.types";

// Direct search places hook
export const useSearchPlaces = (options?: UseSearchPlacesOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      searchRequest: SearchRequest
    ): Promise<SearchResponse> => {
      return await searchService.searchPlaces(searchRequest);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["search-results", data.data.search_info.query],
        data
      );
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

export default useSearchPlaces;
