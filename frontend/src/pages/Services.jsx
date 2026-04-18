import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { Search } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentCategory = searchParams.get('cat') || 'All';
  
  const categories = ['All', 'Salon', 'Cleaning', 'Repair', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Service', 'Other'];

  const fetchWorkers = async (category) => {
    if (category === 'All') {
      setWorkers([]);
      return;
    }
    setLoadingWorkers(true);
    try {
      // Add timestamp to force fresh fetch and bypass any potential browser caching
      const workersRes = await api.get(`/services/workers/${category}?t=${new Date().getTime()}`);
      setWorkers(workersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch workers', error);
    }
    setLoadingWorkers(false);
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await api.get('/services');
        setServices(res.data.data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
      setLoadingServices(false);
    };
    fetchServices();
  }, []); // Only fetch services on mount

  // Fetch workers whenever category changes
  useEffect(() => {
    fetchWorkers(currentCategory);
  }, [currentCategory]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = currentCategory === 'All' || service.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-light py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Explore our wide range of professional home services. We ensure quality, safety, and satisfaction.</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Categories Horizontal Scroll */}
          <div className="w-full md:w-2/3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex space-x-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSearchParams(cat === 'All' ? {} : { cat });
                    fetchWorkers(cat); // forcefully fetch live data even if clicking the same tab
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentCategory === cat 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-primary border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-1/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
            />
          </div>
        </div>

        {/* Results */}
        {loadingServices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 p-4">
                <div className="bg-gray-200 h-40 rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-6 w-3/4 mb-2 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/2 mb-6 rounded"></div>
                <div className="flex justify-between items-center mt-auto">
                  <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
                  <div className="bg-gray-200 h-10 w-1/3 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 mb-4 flex justify-center"><Search className="h-16 w-16" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => { setSearchTerm(''); setSearchParams({}); }}
              className="mt-6 text-primary font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Workers Section (Only visible when category is selected) */}
        {!loadingServices && currentCategory !== 'All' && (
          <div className="mt-16">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">Available Professionals in {currentCategory}</h2>
            {loadingWorkers ? (
               <div className="text-center py-10 text-gray-500 animate-pulse">Loading latest professionals...</div>
            ) : workers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {workers.map(worker => (
                  <div key={worker._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <img 
                      src={worker.avatar || `https://ui-avatars.com/api/?name=${worker.name}`} 
                      alt={worker.name} 
                      className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-gray-50 shadow-sm"
                    />
                    <h3 className="text-sm font-semibold text-accent uppercase tracking-wide mb-1">{worker.serviceType}</h3>
                    <h4 className="text-xl font-bold text-gray-900">{worker.name}</h4>
                    <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                      <span className="text-yellow-500">★</span> {worker.rating.toFixed(1)} <span className="ml-1 text-xs">({worker.completedJobs || 0} jobs)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 text-center">No professionals found for this category yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
