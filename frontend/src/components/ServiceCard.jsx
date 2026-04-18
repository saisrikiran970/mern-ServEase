import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ServiceCard = ({ service }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
      <div className="relative h-48 overflow-hidden group">
        <img 
          src={service.image || 'https://via.placeholder.com/400x300?text=Service'} 
          alt={service.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold text-primary shadow-sm">
          {service.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-semibold text-lg text-gray-900 line-clamp-1">{service.title}</h3>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
            <Star className="w-3 h-3 fill-current" />
            {service.rating > 0 ? service.rating.toFixed(1) : 'New'}
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{service.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <p className="font-bold text-xl text-gray-900">₹{service.price}</p>
          <Link 
            to={`/user/book/${service._id}`} 
            className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
