import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, onRate, readOnly = true }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onRate && onRate(star)}
          disabled={readOnly}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
        >
          <Star 
            className={`w-6 h-6 ${
              star <= Math.round(rating) 
                ? 'fill-accent text-accent' 
                : 'text-gray-300'
            }`} 
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
