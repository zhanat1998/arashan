'use client';

import Image from 'next/image';

interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  images?: string[];
  helpful: number;
}

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

// Demo reviews
const demoReviews: Review[] = [
  {
    id: '1',
    user: 'Айгерим К.',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    rating: 5,
    date: '2024-01-15',
    content: 'Абдан жакшы товар! Сапаты мыкты, баасы арзан. 2 жума колдонуп жатам, эч кандай көйгөй жок. Сатуучуга рахмат!',
    images: ['https://picsum.photos/seed/review1/200/200', 'https://picsum.photos/seed/review2/200/200'],
    helpful: 42,
  },
  {
    id: '2',
    user: 'Бакыт М.',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    rating: 4,
    date: '2024-01-12',
    content: 'Жакшы товар, бирок жеткирүү бир аз узак болду. Сапаты жагынан айтканда - баасына татыктуу.',
    helpful: 18,
  },
  {
    id: '3',
    user: 'Нургүл А.',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    rating: 5,
    date: '2024-01-10',
    content: 'Экинчи жолу заказ кылып жатам. Биринчисин досума белек кылдым, эми өзүмө алдым. Сунуштайм!',
    images: ['https://picsum.photos/seed/review3/200/200'],
    helpful: 31,
  },
];

export default function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const ratingDistribution = [
    { stars: 5, percent: 75 },
    { stars: 4, percent: 15 },
    { stars: 3, percent: 7 },
    { stars: 2, percent: 2 },
    { stars: 1, percent: 1 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Пикирлер ({reviewCount})</h2>

      {/* Rating Summary */}
      <div className="flex gap-8 mb-8 pb-6 border-b border-gray-100">
        <div className="text-center">
          <div className="text-5xl font-bold text-[var(--pdd-red)]">{rating}</div>
          <div className="flex items-center justify-center gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-gray-500">{reviewCount} пикир</div>
        </div>

        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ stars, percent }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-8">{stars}★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10">{percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {demoReviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-gray-100 last:border-none">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image src={review.avatar} alt={review.user} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{review.user}</span>
                  <span className="text-sm text-gray-400">{review.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{review.content}</p>

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.map((image, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image src={image} alt={`Review ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--pdd-red)] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Пайдалуу ({review.helpful})
            </button>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button className="w-full mt-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Бардык пикирлерди көрүү
      </button>
    </div>
  );
}