import { useState, useEffect } from 'react';
import api from '../../api/axios';
import ServiceCard from '../../components/ServiceCard';

const Recommendations = () => {
  const [topServices, setTopServices] = useState([]);
  const [seasonalServices, setSeasonalServices] = useState([]);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/services');
        const allServices = res.data.data;
        
        // Top Rated
        setTopServices([...allServices].sort((a, b) => b.rating - a.rating).slice(0, 4));
        
        // Seasonal Logic
        const month = new Date().getMonth(); // 0-11
        let seasonalCats = [];
        let seasonName = "";
        
        if (month >= 2 && month <= 4) {
          seasonName = "Spring Cleaning";
          seasonalCats = ['Cleaning', 'Painting'];
        } else if (month >= 4 && month <= 7) {
          seasonName = "Summer Essentials";
          seasonalCats = ['AC Service', 'Repair'];
        } else if (month >= 8 && month <= 10) {
          seasonName = "Festival Prep";
          seasonalCats = ['Cleaning', 'Painting', 'Electrical'];
        } else {
          seasonName = "Winter Comfort";
          seasonalCats = ['Plumbing', 'Repair'];
        }

        const seasonal = allServices.filter(s => seasonalCats.includes(s.category)).slice(0, 4);
        setSeasonalServices({ name: seasonName, data: seasonal });

      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-10">
      {seasonalServices.data && seasonalServices.data.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900">{seasonalServices.name}</h2>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">Trending</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalServices.data.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Top Rated Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topServices.map(service => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
