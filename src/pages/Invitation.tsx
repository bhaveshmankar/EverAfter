import { useState } from 'react';
import { Share2, Mail, Download, Edit3, Save, Eye, Copy, MessageSquare } from 'lucide-react';

// Mock template data
const templates = [
  {
    id: 1,
    name: 'Floral Elegance',
    preview: 'https://images.unsplash.com/photo-1509610973147-232dfea52a97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    style: 'floral',
    background: 'bg-gradient-to-r from-pink-100 to-rose-100',
    textColor: 'text-rose-800',
    accentColor: 'border-rose-300',
  },
  {
    id: 2,
    name: 'Minimalist',
    preview: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    style: 'minimalist',
    background: 'bg-gray-50',
    textColor: 'text-gray-800',
    accentColor: 'border-gray-300',
  },
  {
    id: 3,
    name: 'Traditional Gold',
    preview: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    style: 'traditional',
    background: 'bg-amber-50',
    textColor: 'text-amber-900',
    accentColor: 'border-amber-300',
  },
  {
    id: 4,
    name: 'Luxury Marble',
    preview: 'https://images.unsplash.com/photo-1597346908500-28cda8acfe4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    style: 'luxury',
    background: 'bg-white',
    textColor: 'text-gray-900',
    accentColor: 'border-gray-400',
  },
];

// Example fonts
const fontOptions = [
  { name: 'Elegant', value: 'font-serif' },
  { name: 'Modern', value: 'font-sans' },
  { name: 'Handwritten', value: 'font-cursive' },
  { name: 'Classic', value: 'font-mono' },
];

// Example themes (these would control color schemes)
const themeOptions = [
  { name: 'Light', value: 'light', bgColor: 'bg-white', textColor: 'text-gray-900' },
  { name: 'Dark', value: 'dark', bgColor: 'bg-gray-900', textColor: 'text-white' },
  { name: 'Rose', value: 'rose', bgColor: 'bg-rose-50', textColor: 'text-rose-900' },
  { name: 'Blue', value: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
  { name: 'Green', value: 'green', bgColor: 'bg-emerald-50', textColor: 'text-emerald-900' },
];

const Invitation = () => {
  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [activeTab, setActiveTab] = useState('template');
  const [showPreview, setShowPreview] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State for invitation details
  const [invitationData, setInvitationData] = useState({
    coupleNames: 'Sarah & Michael',
    date: '2023-12-15',
    time: '16:00',
    venue: 'The Grand Ballroom, Sunset Hotel',
    address: '123 Wedding Lane, Celebration City',
    message: 'Together with our families, we invite you to share in our joy as we exchange vows and begin our new life together.',
    rsvpDeadline: '2023-11-30',
  });
  
  const [customization, setCustomization] = useState({
    font: fontOptions[0].value,
    theme: themeOptions[0].value,
    backgroundImage: '',
  });

  // Manage uploaded image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // RSVP tracking
  const [rsvpList, setRsvpList] = useState<Array<{name: string, email: string, status: string, plusOne: boolean}>>([
    { name: 'John Smith', email: 'john@example.com', status: 'pending', plusOne: false },
    { name: 'Emma Johnson', email: 'emma@example.com', status: 'confirmed', plusOne: true },
    { name: 'Alex Williams', email: 'alex@example.com', status: 'declined', plusOne: false },
  ]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvitationData({
      ...invitationData,
      [name]: value,
    });
  };
  
  // Handle customization changes
  const handleCustomizationChange = (key: string, value: string) => {
    setCustomization({
      ...customization,
      [key]: value,
    });
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Get background style based on current template and customization
  const getBackgroundStyle = () => {
    if (uploadedImage) {
      return {
        backgroundImage: `url(${uploadedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    const theme = themeOptions.find(theme => theme.value === customization.theme);
    return theme ? { backgroundColor: theme.value === 'dark' ? '#1f2937' : '' } : {};
  };
  
  // Get text color based on theme
  const getTextColorClass = () => {
    const theme = themeOptions.find(theme => theme.value === customization.theme);
    return theme ? theme.textColor : 'text-gray-900';
  };
  
  const getBackgroundColorClass = () => {
    const theme = themeOptions.find(theme => theme.value === customization.theme);
    return theme ? theme.bgColor : 'bg-white';
  };

  // RSVP status update handler
  const handleRsvpStatusUpdate = (index: number, newStatus: string) => {
    const updatedList = [...rsvpList];
    updatedList[index] = {
      ...updatedList[index],
      status: newStatus,
    };
    setRsvpList(updatedList);
  };
  
  // Add guest handler
  const handleAddGuest = () => {
    setRsvpList([
      ...rsvpList,
      { name: '', email: '', status: 'pending', plusOne: false },
    ]);
  };
  
  // Remove guest handler
  const handleRemoveGuest = (index: number) => {
    const updatedList = [...rsvpList];
    updatedList.splice(index, 1);
    setRsvpList(updatedList);
  };
  
  // Mock share functions (in a real app, these would connect to actual sharing APIs)
  const shareViaEmail = () => {
    alert('Email sharing would open here');
  };
  
  const shareViaWhatsApp = () => {
    alert('WhatsApp sharing would open here');
  };
  
  const shareViaFacebook = () => {
    alert('Facebook sharing would open here');
  };
  
  const copyInvitationLink = () => {
    alert('Link copied to clipboard');
  };
  
  const downloadInvitation = () => {
    alert('Invitation would download as PDF here');
  };

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    handleCustomizationChange('theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen pt-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Page header */}
      <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-800' : 'bg-rose-50'} rounded-lg mb-8`}>
        <h1 className="text-3xl font-bold text-center">Digital Wedding Invitation Creator</h1>
        <p className="text-center mt-2 max-w-2xl mx-auto">
          Create beautiful, personalized digital invitations for your special day.
          Customize templates, manage RSVPs, and share with your guests easily.
        </p>
        
        {/* Quick actions */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 flex items-center rounded-full ${
              isDarkMode ? 'bg-rose-600 hover:bg-rose-700' : 'bg-rose-500 hover:bg-rose-600'
            } text-white transition-colors`}
          >
            {showPreview ? <Edit3 className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Edit Invitation' : 'Preview Invitation'}
          </button>
          
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-full ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } transition-colors`}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="container mx-auto px-4 pb-16">
          {/* Preview section */}
          <div className="max-w-2xl mx-auto">
            <div 
              className={`p-8 rounded-lg shadow-lg ${getBackgroundColorClass()} ${getTextColorClass()} ${customization.font} overflow-hidden`}
              style={getBackgroundStyle()}
            >
              <div className="text-center p-6 backdrop-blur-sm bg-white/30 rounded-lg">
                <p className="text-sm uppercase tracking-wider mb-4">You are cordially invited to celebrate the wedding of</p>
                <h2 className="text-3xl font-bold mb-6">{invitationData.coupleNames}</h2>
                
                <div className="my-6 flex flex-col items-center">
                  <p className="text-lg">
                    {new Date(invitationData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-lg">at {invitationData.time}</p>
                  <p className="font-semibold mt-2">{invitationData.venue}</p>
                  <p className="text-sm mt-1">{invitationData.address}</p>
                </div>
                
                <div className="my-6 px-8">
                  <p className="italic">{invitationData.message}</p>
                </div>
                
                <div className="mt-8 border-t border-current pt-4">
                  <p className="font-semibold">Please RSVP by {new Date(invitationData.rsvpDeadline).toLocaleDateString()}</p>
                  <div className="mt-4 flex justify-center space-x-4">
                    <button className={`px-6 py-2 border-2 ${selectedTemplate.accentColor} rounded-full hover:bg-white/50 transition-colors`}>
                      Accept
                    </button>
                    <button className={`px-6 py-2 border-2 ${selectedTemplate.accentColor} rounded-full hover:bg-white/50 transition-colors`}>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button 
                onClick={shareViaEmail}
                className={`px-4 py-2 flex items-center rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow transition-colors`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                onClick={shareViaWhatsApp}
                className={`px-4 py-2 flex items-center rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow transition-colors`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={shareViaFacebook}
                className={`px-4 py-2 flex items-center rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow transition-colors`}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Facebook
              </button>
              <button
                onClick={copyInvitationLink}
                className={`px-4 py-2 flex items-center rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow transition-colors`}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </button>
              <button
                onClick={downloadInvitation}
                className={`px-4 py-2 flex items-center rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow transition-colors`}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode ? 'bg-rose-600 hover:bg-rose-700' : 'bg-rose-500 hover:bg-rose-600'
                } text-white`}
              >
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 pb-16">
          {/* Editor section with tabs */}
          <div className="max-w-4xl mx-auto">
            <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden`}>
              {/* Tabs navigation */}
              <div className="flex">
                <button
                  onClick={() => setActiveTab('template')}
                  className={`px-4 py-3 font-medium flex-1 text-center transition-colors ${
                    activeTab === 'template'
                      ? isDarkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-rose-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Choose Template
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-3 font-medium flex-1 text-center transition-colors ${
                    activeTab === 'details'
                      ? isDarkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-rose-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Event Details
                </button>
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`px-4 py-3 font-medium flex-1 text-center transition-colors ${
                    activeTab === 'customize'
                      ? isDarkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-rose-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Customize
                </button>
                <button
                  onClick={() => setActiveTab('rsvp')}
                  className={`px-4 py-3 font-medium flex-1 text-center transition-colors ${
                    activeTab === 'rsvp'
                      ? isDarkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-rose-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  RSVP Management
                </button>
              </div>
              
              {/* Tab content */}
              <div className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {activeTab === 'template' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Select a Template</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105 ${
                            selectedTemplate.id === template.id
                              ? isDarkMode
                                ? 'ring-2 ring-rose-500'
                                : 'ring-2 ring-rose-500'
                              : isDarkMode
                              ? 'border border-gray-700'
                              : 'border border-gray-200'
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={template.preview} 
                              alt={template.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : template.background}`}>
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : template.textColor}`}>
                              {template.name}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Wedding Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Couple's Names</label>
                        <input
                          type="text"
                          name="coupleNames"
                          value={invitationData.coupleNames}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Wedding Date</label>
                          <input
                            type="date"
                            name="date"
                            value={invitationData.date}
                            onChange={handleInputChange}
                            className={`w-full p-2 rounded-md border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Wedding Time</label>
                          <input
                            type="time"
                            name="time"
                            value={invitationData.time}
                            onChange={handleInputChange}
                            className={`w-full p-2 rounded-md border ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Venue Name</label>
                        <input
                          type="text"
                          name="venue"
                          value={invitationData.venue}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Venue Address</label>
                        <input
                          type="text"
                          name="address"
                          value={invitationData.address}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Custom Message</label>
                        <textarea
                          name="message"
                          value={invitationData.message}
                          onChange={handleInputChange}
                          rows={4}
                          className={`w-full p-2 rounded-md border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">RSVP Deadline</label>
                        <input
                          type="date"
                          name="rsvpDeadline"
                          value={invitationData.rsvpDeadline}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'customize' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Customize Invitation</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Font Style</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {fontOptions.map((font) => (
                            <button
                              key={font.name}
                              onClick={() => handleCustomizationChange('font', font.value)}
                              className={`py-2 px-3 text-center rounded-md transition-colors ${
                                customization.font === font.value
                                  ? isDarkMode
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-500 text-white'
                                  : isDarkMode
                                  ? 'bg-gray-700 hover:bg-gray-600'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              } ${font.value}`}
                            >
                              {font.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Color Theme</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {themeOptions.map((theme) => (
                            <button
                              key={theme.name}
                              onClick={() => handleCustomizationChange('theme', theme.value)}
                              className={`py-2 px-3 text-center rounded-md transition-colors ${
                                customization.theme === theme.value
                                  ? 'ring-2 ring-rose-500'
                                  : ''
                              } ${theme.bgColor} ${theme.textColor}`}
                            >
                              {theme.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Custom Background</label>
                        <div className="flex items-center space-x-4">
                          <label 
                            className={`cursor-pointer flex items-center px-4 py-2 rounded-md ${
                              isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                            <span>Choose Image</span>
                          </label>
                          {uploadedImage && (
                            <button
                              onClick={() => setUploadedImage(null)}
                              className="text-rose-500 hover:text-rose-600"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                        {uploadedImage && (
                          <div className="mt-3 h-24 w-24 overflow-hidden rounded-md">
                            <img
                              src={uploadedImage}
                              alt="Custom background"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'rsvp' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">RSVP Management</h3>
                    <div className="overflow-x-auto">
                      <table className={`min-w-full ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <thead className={isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                          <tr>
                            <th className="py-3 px-4 text-left">Guest Name</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Plus One</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rsvpList.map((guest, index) => (
                            <tr key={index} className={isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={guest.name}
                                  onChange={(e) => {
                                    const updatedList = [...rsvpList];
                                    updatedList[index] = { ...guest, name: e.target.value };
                                    setRsvpList(updatedList);
                                  }}
                                  className={`w-full p-1 rounded ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="email"
                                  value={guest.email}
                                  onChange={(e) => {
                                    const updatedList = [...rsvpList];
                                    updatedList[index] = { ...guest, email: e.target.value };
                                    setRsvpList(updatedList);
                                  }}
                                  className={`w-full p-1 rounded ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={guest.status}
                                  onChange={(e) => handleRsvpStatusUpdate(index, e.target.value)}
                                  className={`p-1 rounded ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border border-gray-300'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="declined">Declined</option>
                                </select>
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="checkbox"
                                  checked={guest.plusOne}
                                  onChange={(e) => {
                                    const updatedList = [...rsvpList];
                                    updatedList[index] = { ...guest, plusOne: e.target.checked };
                                    setRsvpList(updatedList);
                                  }}
                                  className="h-4 w-4 accent-rose-500"
                                />
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleRemoveGuest(index)}
                                  className="text-rose-500 hover:text-rose-600"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={handleAddGuest}
                        className={`px-4 py-2 rounded-md ${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        Add Guest
                      </button>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 text-blue-800">
                      <h4 className="font-semibold">RSVP Management Tips</h4>
                      <ul className="mt-2 list-disc list-inside text-sm">
                        <li>You can send reminders to guests who haven't responded yet</li>
                        <li>Export your guest list to track attendance for venue and catering</li>
                        <li>Send updates to all confirmed guests with a single click</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveTab(
                  activeTab === 'template' ? 'template' :
                  activeTab === 'details' ? 'template' :
                  activeTab === 'customize' ? 'details' : 'customize'
                )}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                disabled={activeTab === 'template'}
              >
                Previous
              </button>
              <div>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-4 py-2 rounded-md ml-2 ${
                    isDarkMode
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-rose-500 hover:bg-rose-600'
                  } text-white`}
                >
                  Preview Invitation
                </button>
                <button
                  onClick={() => alert('Invitation saved!')}
                  className={`px-4 py-2 rounded-md ml-2 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save
                </button>
              </div>
              <button
                onClick={() => setActiveTab(
                  activeTab === 'template' ? 'details' :
                  activeTab === 'details' ? 'customize' :
                  activeTab === 'customize' ? 'rsvp' : 'rsvp'
                )}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                disabled={activeTab === 'rsvp'}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitation; 