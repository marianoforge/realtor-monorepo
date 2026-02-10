declare module "react-slick" {
  import * as React from "react";

  export interface Settings {
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    arrows?: boolean;
    fade?: boolean;
    vertical?: boolean;
    verticalSwiping?: boolean;
    initialSlide?: number;
    lazyLoad?: "ondemand" | "progressive";
    responsive?: Array<{
      breakpoint: number;
      settings: Partial<Settings>;
    }>;
    centerMode?: boolean;
    centerPadding?: string;
    className?: string;
    adaptiveHeight?: boolean;
    swipeToSlide?: boolean;
    focusOnSelect?: boolean;
    pauseOnHover?: boolean;
    pauseOnDotsHover?: boolean;
    pauseOnFocus?: boolean;
    cssEase?: string;
    useCSS?: boolean;
    useTransform?: boolean;
    rtl?: boolean;
    variableWidth?: boolean;
    rows?: number;
    slidesPerRow?: number;
    prevArrow?: React.ReactElement;
    nextArrow?: React.ReactElement;
    appendDots?: (dots: React.ReactNode) => React.ReactElement;
    customPaging?: (index: number) => React.ReactElement;
    dotsClass?: string;
    draggable?: boolean;
    easing?: string;
    edgeFriction?: number;
    swipe?: boolean;
    touchMove?: boolean;
    touchThreshold?: number;
    accessibility?: boolean;
    beforeChange?: (currentSlide: number, nextSlide: number) => void;
    afterChange?: (currentSlide: number) => void;
    onSwipe?: (direction: string) => void;
    onEdge?: (direction: string) => void;
    onInit?: () => void;
    onReInit?: () => void;
    onLazyLoad?: (slidesToLoad: number[]) => void;
    onLazyLoadError?: (error: any) => void;
  }

  class Slider extends React.Component<Settings> {
    slickNext(): void;
    slickPrev(): void;
    slickGoTo(slide: number, dontAnimate?: boolean): void;
    slickPause(): void;
    slickPlay(): void;
  }

  export default Slider;
}
