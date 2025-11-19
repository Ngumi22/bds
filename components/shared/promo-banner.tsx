import Image from "next/image";

interface PromoBannerProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  backgroundColor?: string;
  textColor?: string;
  image?: string;
}

export function PromoBanner({
  title,
  description,
  buttonText = "Shop Now",
  onButtonClick,
  backgroundColor = "bg-gray-200",
  textColor = "text-white",
  image,
}: PromoBannerProps) {
  return (
    <div
      className={`relative ${backgroundColor} rounded-xs shadow-lg h-full overflow-hidden`}>
      <Image
        src={image || "/bannerV5-img5.jpg"}
        alt={title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      <div className="absolute inset-0 bg-black/30 z-1" aria-hidden="true" />

      <div
        className={`absolute top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
                   z-10 flex flex-col items-center text-center
                   ${textColor}`}>
        <h3 className="text-3xl font-semibold">{title}</h3>
        <p className="text-base mt-4 line-clamp-2">{description}</p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        {buttonText && (
          <button
            onClick={onButtonClick}
            className="bg-black text-white px-6 py-2 rounded-sm font-semibold
                       hover:bg-gray-800 transition-colors shadow-md">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
