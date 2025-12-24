import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import Hero from '../components/public/Hero';
import PropertyCard from '../components/public/PropertyCard';
import axiosInstance from '../api/axiosInstance';

const PublicDashboard = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch latest 6 properties
        const response = await axiosInstance.get('/public/properties/search?limit=6');
        setFeaturedProperties(response.data.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-600 mt-2">Handpicked properties just for you</p>
          </div>
          <Link 
            to="/properties/search" 
            className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View All Properties <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link 
            to="/properties/search" 
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View All Properties <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicDashboard;
