import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { toast } from 'sonner';
import { Image as ImageIcon, FileText, MessageSquare, Layout as LayoutIcon, Save, Plus } from 'lucide-react';

const AdminLayoutPage = () => {
  const [activeTab, setActiveTab] = useState('banner');
  const [loading, setLoading] = useState(false);

  // Banner state
  const [bannerData, setBannerData] = useState({
    title: '',
    subTitle: '',
    image: '',
  });

  // FAQ state
  const [faqData, setFaqData] = useState([]);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchLayoutData();
  }, [activeTab]);

  const fetchLayoutData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLayout(activeTab);
      if (response.data?.success && response.data?.layout) {
        const layout = response.data.layout;

        if (activeTab === 'banner') {
          setBannerData({
            title: layout.title || '',
            subTitle: layout.subTitle || '',
            image: layout.image || '',
          });
        } else if (activeTab === 'faq') {
          setFaqData(layout.faq || []);
        } else if (activeTab === 'categories') {
          setCategories(layout.categories || []);
        }
      }
    } catch (error) {
      console.error('Error fetching layout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAPI.createLayout({
        type: 'banner',
        ...bannerData,
      });

      if (response.data?.success) {
        toast.success('Banner saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = () => {
    setFaqData([...faqData, { question: '', answer: '' }]);
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...faqData];
    updated[index][field] = value;
    setFaqData(updated);
  };

  const handleRemoveFaq = (index) => {
    setFaqData(faqData.filter((_, i) => i !== index));
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAPI.createLayout({
        type: 'faq',
        faq: faqData,
      });

      if (response.data?.success) {
        toast.success('FAQ saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { title: newCategory.trim() }]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSaveCategories = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAPI.createLayout({
        type: 'categories',
        categories,
      });

      if (response.data?.success) {
        toast.success('Categories saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerData({ ...bannerData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Layout Management</h1>
        <p className="text-gray-600">Manage homepage layout, banners, FAQs, and categories</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('banner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'banner'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>Banner</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'faq'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>FAQ</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <LayoutIcon className="h-4 w-4" />
                <span>Categories</span>
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'banner' && (
            <form onSubmit={handleSaveBanner} className="space-y-6 max-w-2xl">
              <div>
                <label htmlFor="banner-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title
                </label>
                <input
                  id="banner-title"
                  type="text"
                  value={bannerData.title}
                  onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Master Modern Web Development"
                />
              </div>

              <div>
                <label htmlFor="banner-subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Subtitle
                </label>
                <textarea
                  id="banner-subtitle"
                  value={bannerData.subTitle}
                  onChange={(e) => setBannerData({ ...bannerData, subTitle: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Interactive courses taught by industry leaders"
                />
              </div>

              <div>
                <label htmlFor="banner-image" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <input
                  id="banner-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {bannerData.image && (
                  <img
                    src={bannerData.image}
                    alt="Banner preview"
                    className="mt-4 h-48 w-full object-cover rounded-lg"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Banner'}</span>
              </button>
            </form>
          )}

          {activeTab === 'faq' && (
            <form onSubmit={handleSaveFaq} className="space-y-6 max-w-3xl">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">FAQ #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="What is KitabiKeeda?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="KitabiKeeda is a modern learning platform..."
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add FAQ</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save FAQ'}</span>
              </button>
            </form>
          )}

          {activeTab === 'categories' && (
            <form onSubmit={handleSaveCategories} className="space-y-6 max-w-2xl">
              <div>
                <label htmlFor="new-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Category
                </label>
                <div className="flex space-x-2">
                  <input
                    id="new-category"
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Web Development"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <span className="text-gray-900">{category.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Categories'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLayoutPage;
