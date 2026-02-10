import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonLoaderProps {
  height?: number;
  count?: number;
  width?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = "",
  count = 10,
  width = "",
  className = "",
}) => {
  return (
    <Skeleton
      height={height}
      count={count}
      width={width}
      className={className}
    />
  );
};

export default SkeletonLoader;
