import { useState, useRef, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Image as ImageIcon,
  IdCard,
  Smartphone,
  Flag,
  CalendarDays,
  User,
  Mail,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import profileService from "../services/profile_service";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with direct configurations
const supabase = createClient(
  'https://rntctuwbqtlklrwebxlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGN0dXdicXRsa2xyd2VieGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDQ2MzEsImV4cCI6MjA3Njg4MDYzMX0.e3Ir6Ro051jO0rtveFTk01XL1AsMWFqIQyxPOZGzodY'
);

const ProfileScreen = () => {
  const [isDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Get logged in user data from localStorage
  const getLoggedInUser = () => {
    try {
      const userLoginData = localStorage.getItem("userLogin");
      if (userLoginData) {
        return JSON.parse(userLoginData);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
    return null;
  };

  const loggedInUser = getLoggedInUser();
  const loggedInUsername = loggedInUser?.user?.userName || loggedInUser?.userName || "";

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    national_id_number: "",
    phone_number: "",
    whatsapp_number: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    country_of_residence: "",
    email: "",
    username: loggedInUsername,
    role: "",
    joinDate: "",
    profile_pic: "",
    cover_photo: "",
  });
  
  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
    national_id_number: "",
    phone_number: "",
    whatsapp_number: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    country_of_residence: "",
    email: "",
    username: loggedInUsername,
    role: "",
    joinDate: "",
    profile_pic: "",
    cover_photo: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileService.getMyProfile();
        console.log("📊 Full API Response:", response);
        
        if (response && response.profile) {
          const data = response.profile;
          console.log("📊 Profile data:", data);
          console.log("📊 UserId data:", data.userId);
          
          // Map API response to our state structure - prioritize userId data
          const mappedProfile = {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            national_id_number: data.nationalId || data.national_id_number || "",
            phone_number: data.phoneNumber || data.phone_number || "",
            whatsapp_number: data.whatsapp_number || "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
            gender: data.gender || "",
            address: data.address || "",
            country_of_residence: data.country_of_residence || "",
            // Always use userId data for these fields
            email: data.userId?.email || "",
            username: data.userId?.userName || loggedInUsername,
            role: data.userId?.role || "",
            joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
            profile_pic: data.profilePicture || data.profile_pic || "",
            cover_photo: data.cover_photo || "",
          };
          
          console.log("🔄 Mapped profile:", mappedProfile);
          
          setProfile(mappedProfile);
          setEditedProfile(mappedProfile);
        } else {
          console.warn("No profile data found in response");
          // If no profile data, use localStorage data
          const fallbackProfile = {
            firstName: "",
            lastName: "",
            national_id_number: "",
            phone_number: "",
            whatsapp_number: "",
            dateOfBirth: "",
            gender: "",
            address: "",
            country_of_residence: "",
            email: loggedInUser?.user?.email || loggedInUser?.email || "",
            username: loggedInUsername,
            role: loggedInUser?.user?.role || loggedInUser?.role || "",
            joinDate: "",
            profile_pic: "",
            cover_photo: "",
          };
          setProfile(fallbackProfile);
          setEditedProfile(fallbackProfile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Use localStorage data as fallback
        const fallbackProfile = {
          firstName: "",
          lastName: "",
          national_id_number: "",
          phone_number: "",
          whatsapp_number: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          country_of_residence: "",
          email: loggedInUser?.user?.email || loggedInUser?.email || "",
          username: loggedInUsername,
          role: loggedInUser?.user?.role || loggedInUser?.role || "",
          joinDate: "",
          profile_pic: "",
          cover_photo: "",
        };
        setProfile(fallbackProfile);
        setEditedProfile(fallbackProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [loggedInUsername]);

  // Upload image to Supabase
  const uploadImageToSupabase = async (file: File, folder: 'avatars' | 'covers') => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('profile')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
      
        .from('profile')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image to Supabase:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleInput = (field: string, value: string) =>
    setEditedProfile((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare data for API in the expected format
      const apiData = {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        nationalId: editedProfile.national_id_number,
        phoneNumber: editedProfile.phone_number,
        whatsapp_number: editedProfile.whatsapp_number,
        dateOfBirth: editedProfile.dateOfBirth,
        gender: editedProfile.gender,
        address: editedProfile.address,
        country_of_residence: editedProfile.country_of_residence,
        profilePicture: editedProfile.profile_pic,
        cover_photo: editedProfile.cover_photo,
      };
      
      const response = await profileService.updateMyProfile(apiData);
      
      // Map the response back to our state
      if (response && response.profile) {
        const data = response.profile;
        const mappedProfile = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          national_id_number: data.nationalId || data.national_id_number || "",
          phone_number: data.phoneNumber || data.phone_number || "",
          whatsapp_number: data.whatsapp_number || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          gender: data.gender || "",
          address: data.address || "",
          country_of_residence: data.country_of_residence || "",
          // Keep the original userId data that doesn't change
          email: data.userId?.email || profile.email,
          username: data.userId?.userName || profile.username,
          role: data.userId?.role || profile.role,
          joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : profile.joinDate,
          profile_pic: data.profilePicture || data.profile_pic || "",
          cover_photo: data.cover_photo || "",
        };
        
        setProfile(mappedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Determine folder based on field type
      const folder = field === 'profile_pic' ? 'avatars' : 'covers';
      
      // Upload to Supabase
      const imageUrl = await uploadImageToSupabase(file, folder);
      
      // Update the edited profile with the new image URL
      setEditedProfile((prev) => ({ ...prev, [field]: imageUrl }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  // Use username from userId for display - don't use firstName/lastName from API
  const displayName = profile.username || loggedInUsername;
  
  // Generate initials from username only
  const getInitials = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const initials = getInitials();

  const themeClasses = {
    bg: "bg-red-500/10",
    card: isDarkMode ? "bg-gray-800" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-gray-600",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
  };

  return (
    <div className={`flex h-screen ${themeClasses.bg}`}>
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className={`${themeClasses.card} shadow-sm border-b ${themeClasses.border} p-4`}
        >
          <div className="flex justify-between items-center">
            <button
              className="lg:hidden p-2 bg-gray-200 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-lg">Profile</h2>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-sm hidden sm:block">
                {displayName || "User"}
              </p>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 relative">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* === COVER & PROFILE PHOTO SECTION === */}
              <div
                className={`${themeClasses.card} rounded-2xl overflow-hidden border ${themeClasses.border}`}
              >
                <div className="relative h-48 ">
                  {editedProfile.cover_photo ? (
                    <img
                      src={editedProfile.cover_photo}
                      className="w-full h-full object-cover"
                      alt="Cover"
                      onError={(e) => {
                        // If image fails to load, show default background
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">Cover Photo</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-red-600/20 mix-blend-multiply pointer-events-none" />

                  {isEditing && (
                    <>
                      <input
                        ref={coverFileRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cover_photo")}
                        disabled={uploading}
                      />
                      <button
                        onClick={() => coverFileRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-lg text-xs flex gap-2 disabled:opacity-50"
                      >
                        <ImageIcon size={16} /> 
                        {uploading ? "Uploading..." : "Change Cover"}
                      </button>
                    </>
                  )}
                </div>

                <div className="p-6 -mt-16 flex items-end justify-between">
                  <div className="flex items-end gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-gray-400 flex items-center justify-center text-3xl font-bold text-white">
                        {editedProfile.profile_pic ? (
                          <img
                            src={editedProfile.profile_pic}
                            className="w-full h-full object-cover"
                            alt="Profile"
                            onError={(e) => {
                              // If profile image fails to load, show initials
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // The initials will show as fallback since they're in the same container
                            }}
                          />
                        ) : null}
                        {!editedProfile.profile_pic && initials}
                      </div>

                      {isEditing && (
                        <>
                          <input
                            ref={avatarFileRef}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "profile_pic")}
                            disabled={uploading}
                          />
                          <button
                            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 text-white flex items-center justify-center text-xs rounded-2xl transition-opacity disabled:opacity-0"
                            onClick={() => avatarFileRef.current?.click()}
                            disabled={uploading}
                          >
                            <Camera size={16} className="mr-1" /> 
                            {uploading ? "Uploading..." : "Change"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* User Info Section - Only show username from userId */}
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {displayName || "User"}
                      </h1>
                      <p className="text-gray-600 mt-1 flex items-center gap-2">
                        <Mail size={16} />
                        {profile.email}
                      </p>
                      <p className="text-gray-600 mt-1 flex items-center gap-2">
                        <User size={16} />
                        @{displayName}
                      </p>
                      <p className="text-gray-600 mt-1 capitalize">
                        Role: {profile.role}
                      </p>
                      {profile.joinDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Member since {profile.joinDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 size={16} className="inline mr-2" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={uploading || saving}
                        className="px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 transition-colors disabled:opacity-50"
                      >
                        <X size={16} className="inline mr-2" /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving || uploading}
                        className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving..." : <><Save size={16} className="inline mr-2" /> Save</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* === USER ACCOUNT INFO SECTION === */}
              <div
                className={`${themeClasses.card} border ${themeClasses.border} rounded-2xl p-6 space-y-5`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                
                <Field
                  icon={<User className="text-blue-600" />}
                  label="Username"
                  value={displayName || ""}
                  disabled={true}
                />

                <Field
                  icon={<Mail className="text-green-600" />}
                  label="Email Address"
                  value={profile.email || ""}
                  disabled={true}
                />

                <Field
                  icon={<IdCard className="text-purple-600" />}
                  label="Role"
                  value={profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ""}
                  disabled={true}
                />
              </div>

              {/* === CONTACT + PERSONAL INFO SECTION === */}
              <div
                className={`${themeClasses.card} border ${themeClasses.border} rounded-2xl p-6 space-y-5`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

                <Field
                  icon={<IdCard className="text-blue-600" />}
                  label="National ID Number"
                  value={editedProfile.national_id_number || ""}
                  disabled={!isEditing}
                  onChange={(v: string) => handleInput("national_id_number", v)}
                />

                <Field
                  icon={<Phone className="text-blue-600" />}
                  label="Phone Number"
                  value={editedProfile.phone_number || ""}
                  disabled={!isEditing}
                  onChange={(v: string) => handleInput("phone_number", v)}
                />

                <Field
                  icon={<Smartphone className="text-green-600" />}
                  label="WhatsApp Number"
                  value={editedProfile.whatsapp_number || ""}
                  disabled={!isEditing}
                  onChange={(v: string) => handleInput("whatsapp_number", v)}
                />

                <Field
                  icon={<MapPin className="text-red-600" />}
                  label="Address"
                  value={editedProfile.address || ""}
                  disabled={!isEditing}
                  onChange={(v: string) => handleInput("address", v)}
                />

                <Field
                  icon={<Flag className="text-purple-600" />}
                  label="Country of Residence"
                  value={editedProfile.country_of_residence || ""}
                  disabled={!isEditing}
                  onChange={(v: string) => handleInput("country_of_residence", v)}
                />

                <Field
                  icon={<CalendarDays className="text-orange-600" />}
                  label="Date of Birth"
                  value={editedProfile.dateOfBirth || ""}
                  disabled={!isEditing}
                  type="date"
                  onChange={(v: string) => handleInput("dateOfBirth", v)}
                />

                <Field
                  label="Gender"
                  value={editedProfile.gender || ""}
                  disabled={!isEditing}
                  onChange={(v: string) => handleInput("gender", v)}
                  select={isEditing}
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" }
                  ]}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Field component
const Field = ({ 
  icon, 
  label, 
  value, 
  disabled, 
  onChange, 
  type = "text",
  select = false,
  options = [] 
}: any) => (
  <div className="flex items-center gap-3">
    {icon && <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {disabled ? (
        <div className="text-gray-900 text-sm py-1">{value || "Not provided"}</div>
      ) : select ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  </div>
);

export default ProfileScreen;