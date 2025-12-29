import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import PersonStore from "../stores/PersonStore";
import { Loader2, Plus, Search, User } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const PersonSelect = observer(({ label, name, value, onChange, error, touched }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    if (value) {
      fetchSelectedPerson(value);
    }
  }, [value]);

  const fetchSelectedPerson = async (id) => {
    const person = await PersonStore.fetchPersonById(id);
    if (person) {
      setSelectedName(person.full_name);
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/persons?search=${query}`);
      setResults(response.data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Failed to search persons", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (person) => {
    onChange(person.id);
    setSelectedName(person.full_name);
    setSearch("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {value ? (
        <div className="flex items-center justify-between px-4 py-2 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            <span className="text-green-800 font-medium">{selectedName}</span>
          </div>
          <button
            type="button"
            onClick={() => { onChange(""); setSelectedName(""); }}
            className="text-xs text-red-600 hover:underline"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            className={`w-full pl-10 pr-4 py-2 border ${error && touched ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => search.length >= 2 && setShowDropdown(true)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {results.map((person) => (
            <div
              key={person.id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              onClick={() => handleSelect(person)}
            >
              <div className="font-medium text-gray-900">{person.full_name}</div>
              <div className="text-xs text-gray-500">{person.phone} | {person.email || 'No email'}</div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && search.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">No person found matching "{search}"</p>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            onClick={() => {
              // Logic to open a "Create New Person" modal could go here
              alert("Feature coming soon: Create new person directly from here.");
            }}
          >
            <Plus className="w-4 h-4" /> Add New Person
          </button>
        </div>
      )}

      {error && touched && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
});

export default PersonSelect;
