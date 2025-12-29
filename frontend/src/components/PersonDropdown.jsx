import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, User, ChevronDown, Loader2 } from 'lucide-react';
import PersonStore from '../stores/PersonStore';

const PersonDropdown = observer(({ label, value, onChange, placeholder = "Select a person..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    PersonStore.fetchPersons();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPerson = PersonStore.persons.find(p => p.id === value);
  
  const filteredPersons = PersonStore.persons.filter(person => 
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone?.includes(searchTerm) ||
    person.national_id?.includes(searchTerm)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-all ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <User size={20} className={selectedPerson ? "text-blue-600" : "text-gray-400"} />
          <span className={`truncate ${selectedPerson ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {selectedPerson ? selectedPerson.full_name : placeholder}
          </span>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-50 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Search by name, phone or ID..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {PersonStore.loading && PersonStore.persons.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
              </div>
            ) : filteredPersons.length > 0 ? (
              filteredPersons.map((person) => (
                <div
                  key={person.id}
                  onClick={() => {
                    onChange(person.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col transition-colors ${value === person.id ? 'bg-blue-50' : ''}`}
                >
                  <span className={`font-semibold ${value === person.id ? 'text-blue-700' : 'text-gray-900'}`}>
                    {person.full_name}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{person.phone}</span>
                    {person.national_id && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>ID: {person.national_id}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No persons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default PersonDropdown;
