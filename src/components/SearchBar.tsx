import React from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="fixed flex flex-col z-50 bg-[#f7f7f7] -mt-15 w-full h-[25vh] justify-end items-center">
      <header className="p-4 text-center text-xl  font-bold">
        SpaceX Launches
      </header>
      <div className="relative shadow-md rounded-md p-[18px] mt-5 mb-4 flex justify-center">
        <input
          type="text"
          className="w-[35vw] min-w-[300px] p-2 rounded-lg border-2 border-gray-300"
          placeholder="Search launches"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
