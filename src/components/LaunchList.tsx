/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import LaunchItem from "./LaunchItem";
import Loading from "./Loading";
import { useDebounce } from "use-debounce";
import SearchBar from "./SearchBar";

interface Links {
  mission_patch_small?: string;
}

interface Rocket {
  rocket_name?: string;
}

interface Launch {
  flight_number: number;
  mission_name: string;
  launch_year: string;
  rocket: Rocket;
  links: Links;
  launch_date_utc: string;
  [key: string]: unknown;
}

const API_URL = "https://api.spacexdata.com/v3/launches";

const LaunchList: React.FC = () => {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [allLaunches, setAllLaunches] = useState<Launch[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [lazyLoading, setLazyLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Manage the search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500); // Add debounced value for smooth typing
  const [error, setError] = useState<string | null>(null);
  const [filteredLaunches, setFilteredLaunches] = useState<Launch[]>([]); // Manage filtered launches

  const observer = useRef<IntersectionObserver | null>(null);

  const lastLaunchElementRef = useCallback(
    (node: Element | null) => {
      if (loading || debouncedSearchQuery.trim()) return; // Avoid triggering pagination during search
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLazyLoading(true); // Indicate that the next page is being fetched
          setPage((prevPage: number) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, debouncedSearchQuery]
  );

  const fetchLaunches = useCallback(
    async (reset = false, pageOverride?: number) => {
      try {
        const currentPage = pageOverride ?? page;
        const { data } = await axios.get(API_URL, {
          params: { limit: 10, offset: (currentPage - 1) * 10 },
        });

        if (reset) {
          setLaunches(data); // Reset and set fetched data
          setAllLaunches(data); // Store the fetched data for search purposes
        } else {
          setLaunches((prevLaunches) => [...prevLaunches, ...data]);
          setAllLaunches((prevLaunches) => [...prevLaunches, ...data]);
        }

        setHasMore(data.length > 0); // Stop fetching if no more data
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError("Failed to load launches. Please try again.");
        console.error("Error fetching launches", error.message);
      } finally {
        setLoading(false);
        setLazyLoading(false); // Stop lazy loading spinner
      }
    },
    [page]
  );

  useEffect(() => {
    setLoading(true); // Show spinner for initial load
    if (debouncedSearchQuery.trim() === "") {
      setPage(1); // Reset to the first page
      setHasMore(true);
      setFilteredLaunches([]); // Clear previous filtered results
      setFilteredLaunches([]); // Clear previous filtered results
      fetchLaunches(true,1);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.trim() !== "") return; // Avoid triggering pagination during search
    fetchLaunches();
  }, [page]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setFilteredLaunches(
        allLaunches.filter((launch) =>
          launch.mission_name
            .toLowerCase()
            .includes(debouncedSearchQuery.trim().toLowerCase())
        )
      );
    } else {
      setFilteredLaunches([]); // Clear filtered results when search is cleared
    }
  }, [debouncedSearchQuery]);

  return (
    <div className="p-4 flex flex-col items-center">
      {/* Ensure the SearchBar is working */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Conditionally render launches based on search query */}
      {debouncedSearchQuery.trim() ? (
        <div className="relative flex flex-col w-[37vw] min-w-[338px] mt-42">
          {filteredLaunches.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No results found.</p>
          ) : (
            filteredLaunches.map((launch) => (
              <div
                className="flex flex-col h-auto p-4 rounded-lg shadow-lg w-[37vw] min-w-[338px] bg-[#971a1a] z-40 hover:shadow-xl transition duration-300 ease-in-out mb-4"
                key={launch.flight_number}
              >
                <LaunchItem launch={launch} />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col w-[37vw] min-w-[338px] mt-42">
          {launches
            .slice()
            .reverse()
            .map((launch, index) => {
              const launchContent = (
                <div
                  className="p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out mb-4"
                  key={launch.flight_number}
                >
                  <LaunchItem launch={launch} />
                </div>
              );

              if (index === launches.length - 1) {
                return (
                  <div ref={lastLaunchElementRef} key={launch.flight_number}>
                    {launchContent}
                  </div>
                );
              }

              return launchContent;
            })}
        </div>
      )}

      {/* Show spinner for lazy loading */}
      {lazyLoading && <Loading />}
      {/* Show error message */}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {/* No more launches message */}
      {!hasMore && !loading && launches.length > 0 && (
        <p className="text-center mt-4">No more launches to show</p>
      )}
    </div>
  );
};

export default LaunchList;
