import { useEffect, useState } from "react";
import {
  XMarkIcon,
  NewspaperIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface NewsItem {
  title: string;
  summary: string;
  source?: string;
  url?: string;
}

interface MarketNewsResponse {
  news: NewsItem[];
  error?: string;
  cacheInfo?: {
    lastUpdated?: string;
    nextUpdate?: string;
    source: "cache" | "fresh" | "fallback";
  };
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cacheInfo, setCacheInfo] =
    useState<MarketNewsResponse["cacheInfo"]>(undefined);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/market-news");
      const data: MarketNewsResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setNews(data.news);
      }
      setCacheInfo(data.cacheInfo);
    } catch (err) {
      setError("Error al cargar las noticias");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openModal = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-white shadow-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <NewspaperIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Noticias del Mercado Inmobiliario
            </h2>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-white shadow-lg border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <NewspaperIcon className="w-5 h-5 text-red-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Noticias del Mercado Inmobiliario
            </h2>
          </div>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 rounded-xl bg-white shadow-lg border hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <NewspaperIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Noticias del Mercado Inmobiliario
            </h2>
          </div>
        </div>

        {cacheInfo && cacheInfo.lastUpdated && (
          <div className="mb-3 text-xs text-gray-500 flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                cacheInfo.source === "fresh"
                  ? "bg-green-500"
                  : cacheInfo.source === "cache"
                    ? "bg-blue-500"
                    : "bg-gray-500"
              }`}
            ></span>
            Actualizado: {formatLastUpdated(cacheInfo.lastUpdated)}
            {cacheInfo.source === "cache" && " (caché)"}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {news.length === 0 ? (
            <div className="col-span-full">
              <p className="text-gray-500 text-sm">
                No hay noticias disponibles en este momento.
              </p>
            </div>
          ) : (
            news.map((newsItem, index) => (
              <div
                key={index}
                className="cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 border-l-4 border-blue-500 h-full"
                onClick={() => openModal(newsItem)}
              >
                <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {newsItem.title}
                </h3>
                {newsItem.source && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {newsItem.source}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Click para ver resumen completo
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {selectedNews.title}
                  </h2>
                  {selectedNews.source && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {selectedNews.source}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNews.summary}
                </p>
              </div>

              {selectedNews.url &&
                selectedNews.url !== "Sin URL disponible" &&
                selectedNews.url !== "https://example.com/market-analysis" &&
                selectedNews.url !==
                  "https://www.realestate.com/market-analysis" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={selectedNews.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Leer artículo completo en {selectedNews.source}
                    </a>
                  </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
