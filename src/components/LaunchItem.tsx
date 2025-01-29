import React, { useState } from "react";

interface Rocket {
  rocket_name?: string;
}

interface LaunchLinks {
  mission_patch_small?: string;
  article_link?: string;
  video_link?: string;
}

interface Launch {
  mission_name: string;
  launch_year: string;
  rocket?: Rocket;
  details?: string;
  launch_success?: boolean;
  upcoming?: boolean;
  launch_date_utc: string;
  links: LaunchLinks;
}

interface LaunchItemProps {
  launch: Launch;
}

const LaunchItem: React.FC<LaunchItemProps> = ({ launch }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false); 
  const [imageLoading, setImageLoading] = useState<boolean>(true); 

  
  let statusClass = "launch__status--unknown";
  let statusText = "TBD";

  if (launch.launch_success === false && launch.upcoming === false) {
    statusClass = "launch__status--danger";
    statusText = "Failed";
  } else if (launch.launch_success === true) {
    statusClass = "launch__status--success";
    statusText = "Success";
  } else if (launch.upcoming === true) {
    statusClass = "launch__status--info";
    statusText = "Upcoming";
  }

  const getRelativeTime = (dateString: string): string => {
    const launchDate = new Date(dateString); 
    const now = new Date();
    const diffInSeconds = (now.getTime() - launchDate.getTime()) / 1000;

  

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (diffInSeconds < 60) {
      return rtf.format(Math.round(-diffInSeconds), "seconds");
    }

    const diffInMinutes = diffInSeconds / 60;
    if (diffInMinutes < 60) {
      return rtf.format(Math.round(-diffInMinutes), "minutes");
    }

    const diffInHours = diffInMinutes / 60;
    if (diffInHours < 24) {
      return rtf.format(Math.round(-diffInHours), "hours");
    }

    const diffInDays = diffInHours / 24;
    if (diffInDays < 30) {
      return rtf.format(Math.round(-diffInDays), "days");
    }

    const diffInMonths = diffInDays / 30;
    if (diffInMonths < 12) {
      return rtf.format(Math.round(-diffInMonths), "months");
    }

    const diffInYears = diffInMonths / 12;
    return rtf.format(Math.round(-diffInYears), "years");
  };

  const handleImageLoad = () => {
    setImageLoading(false); 
  };

  const handleImageError = () => {
    setImageLoading(false); 
  };

  return (
    <div className="p-4 rounded-lg mb-4 border-2 border-gray-300 shadow-md">
     
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{launch.mission_name}</h3>
        <span className={`launch__status ${statusClass}`}>{statusText}</span>
      </div>
      <div className="flex items-center">
        <p className="text-gray-400 pr-2">
          {getRelativeTime(launch.launch_date_utc)}
        </p>
        {launch.links.article_link && (
          <>
            <span className="separator">|</span>
            <a
              href={launch.links.article_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 p-2"
            >
              Article
            </a>
          </>
        )}

        {launch.links.video_link && (
          <>
            <span className="separator">|</span>
            <a
              href={launch.links.video_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 p-2"
            >
              Video
            </a>
          </>
        )}
      </div>

     
      {showDetails && (
        <div className="mt-4 flex items-start">
          {launch.links.mission_patch_small ? (
            <div className="relative">
              {imageLoading && (
                <div className="relative inset-0 w-[120px] h-[70px] flex justify-center items-center">
                  <div className="spinner-border animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              <img
                src={launch.links.mission_patch_small}
                alt={launch.mission_name}
                className="mb-4 mr-5"
                style={{
                  maxWidth: "120px",
                  maxHeight: "120px",
                  objectFit: "contain",
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500 mr-10">No image available.</p>
          )}
          {launch.details ? (
            <p className="text-sm text-gray-700">{launch.details}</p>
          ) : (
            <p className="text-sm text-gray-500">No details available.</p>
          )}
        </div>
      )}

     
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        {showDetails ? "Hide Details" : "View Details"}
      </button>
    </div>
  );
};

export default LaunchItem;
