import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../../layouts/HomeLayout";
import ThemedSelect from "../../components/common/ThemedSelect";
import { UploadCloud, Pencil } from "lucide-react";
import { getProfile, updateProfile } from "../../api/userApi";
import { getSkills } from "../../api/choiceApis/skillApi";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext"; // adjust path if needed

// Same as ProfilePage — relative image paths from this API need a base
// URL prefix. Centralize this in one place (env var / axios config)
// instead of duplicating it across files.

export default function UpdateProfile() {
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate= useNavigate()

  const [formData, setFormData] = useState({
    profileImage: null,
    coverImage: null,

    firstName: "",
    lastName: "",

    headline: "",
    bio: "",

    gender: "",
    dob: "",

    phone: "",

    country: "",
    state: "",
    city: "",
    address: "",

    company: "",
    designation: "",

    websiteUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    twitterUrl: "",

    experienceYears: "",

    skills: [],
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [skillOptions, setSkillOptions] = useState([]);

  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

 const handleChange = (e) => {
  setFormData((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};

const handleSkillsChange = (selected) => {
  setFormData((prev) => ({
    ...prev,
    skills: selected || [],
  }));
};

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingProfile(true);

      const skillsResponse = await getSkills();

      const skillsData =
        skillsResponse?.data?.data || skillsResponse?.data || skillsResponse;

      const formattedSkills = skillsData.map((skill) => ({
        value: skill.id,
        label: skill.name,
      }));

      setSkillOptions(formattedSkills);

      const profileResponse = await getProfile();

      if (profileResponse.data?.success) {
        const profile = profileResponse.data.data;

        let selectedSkills = [];

        try {
          const skillIds = profile.skills ? JSON.parse(profile.skills) : [];

          selectedSkills = formattedSkills.filter((skill) =>
            skillIds.includes(skill.value),
          );
        } catch (e) {
          console.error("Skill parsing failed", e);
        }

        setFormData({
          profileImage: null,
          coverImage: null,

          firstName: profile.firstName || "",

          lastName: profile.lastName || "",

          headline: profile.headline || "",

          bio: profile.bio || "",

          gender: profile.gender || "",

          dob: profile.dob || "",

          phone: profile.phone || "",

          country: profile.country || "",

          state: profile.state || "",

          city: profile.city || "",

          address: profile.address || "",

          company: profile.company || "",

          designation: profile.designation || "",

          websiteUrl: profile.websiteUrl || "",

          githubUrl: profile.githubUrl || "",

          linkedinUrl: profile.linkedinUrl || "",

          twitterUrl: profile.twitterUrl || "",

          experienceYears: profile.experienceYears || "",

          skills: selectedSkills,
        });

        setProfilePreview(profile.profileImage || null);

        setCoverPreview(profile.coverImage || null);
      }
    } catch (error) {
      console.error(error);

      toast.error("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await getSkills();
      const formattedSkills = response.map((skill) => ({
        value: skill.id,
        label: skill.name,
      }));
      setSkillOptions(formattedSkills);
    } catch (error) {
      console.error("Failed to load skills", error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);

      const response = await getProfile();

      if (response.data?.success) {
        const profile = response.data.data;

        const selectedSkills = skillOptions.filter((skill) =>
          profile.skills?.includes(skill.label),
        );

        setFormData((prev) => ({
          ...prev,

          firstName: profile.firstName || "",
          lastName: profile.lastName || "",

          headline: profile.headline || "",
          bio: profile.bio || "",

          // Backend returns "Gender" (capitalized) — fall back to
          // lowercase too in case that gets fixed server-side later.
          gender: profile.Gender || profile.gender || "",
          dob: profile.dob || "",
          phone: profile.phone || "",

          country: profile.country || "",
          state: profile.state || "",
          city: profile.city || "",
          address: profile.address || "",

          company: profile.company || "",
          designation: profile.designation || "",

          websiteUrl: profile.websiteUrl || "",
          githubUrl: profile.githubUrl || "",
          linkedinUrl: profile.linkedinUrl || "",
          twitterUrl: profile.twitterUrl || "",

          experienceYears: profile.experienceYears ?? "",

          skills: selectedSkills,

          profileImage: null,
          coverImage: null,
        }));

        setProfilePreview(profile.profileImage);
        setCoverPreview(profile.coverImage);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      toast.error("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, profileImage: file }));
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleCoverImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, coverImage: file }));
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = new FormData();

      payload.append("firstName", formData.firstName);

      payload.append("lastName", formData.lastName);

      payload.append("headline", formData.headline);

      payload.append("bio", formData.bio);

      payload.append("gender", formData.gender);

      payload.append("dob", formData.dob);

      payload.append("phone", formData.phone);

      payload.append("country", formData.country);

      payload.append("state", formData.state);

      payload.append("city", formData.city);

      payload.append("address", formData.address);

      payload.append("company", formData.company);

      payload.append("designation", formData.designation);

      payload.append("websiteUrl", formData.websiteUrl);

      payload.append("githubUrl", formData.githubUrl);

      payload.append("linkedinUrl", formData.linkedinUrl);

      payload.append("twitterUrl", formData.twitterUrl);

      payload.append("experienceYears", formData.experienceYears || 0);

      payload.append(
        "skills",
        JSON.stringify(formData.skills.map((skill) => skill.value)),
      );

      if (formData.profileImage) {
        payload.append("profileImage", formData.profileImage);
      }

      if (formData.coverImage) {
        payload.append("coverImage", formData.coverImage);
      }

      const response = await updateProfile(payload);

      if (response.data?.success) {
        toast.success("Profile updated successfully");
        navigate("/profile")
        loadData();
      }
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };


  if (loadingProfile) {
    return (
      <HomeLayout>
        <div className="max-w-5xl mx-auto p-6">
          <p className="body-sm">Loading profile…</p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="card p-lg">
          <h1 className="heading-lg" style={{ marginBottom: 4 }}>
            Edit Profile
          </h1>
          <p className="body-sm" style={{ marginBottom: 32 }}>
            Update your public profile information.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Profile image — centered circle on top */}
            <div
              className="form-group"
              style={{ alignItems: "center", marginBottom: 8 }}
            >
              <label className="form-label" style={{ alignSelf: "flex-start" }}>
                Profile Image
              </label>

              <div style={{ position: "relative", width: 120, height: 120 }}>
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="object-cover"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      border: "1px solid var(--border)",
                    }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      border: "1px dashed var(--border)",
                      backgroundColor: "var(--surface)",
                    }}
                  >
                    <UploadCloud size={22} className="text-secondary" />
                  </div>
                )}

                <label
                  className="btn btn-primary btn-icon absolute"
                  style={{ bottom: 0, right: 0, cursor: "pointer" }}
                  aria-label="Change profile image"
                >
                  <Pencil size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Cover image — full width below profile image */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Cover Image</label>

              {coverPreview ? (
                <div
                  className="relative w-full h-40 overflow-hidden"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <label
                    className="btn btn-primary btn-icon absolute"
                    style={{ bottom: 8, right: 8, cursor: "pointer" }}
                    aria-label="Change cover image"
                  >
                    <Pencil size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImage}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center gap-2 w-full h-40 cursor-pointer"
                  style={{
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <UploadCloud size={20} className="text-secondary" />
                  <span className="body-sm">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Headline</label>
              <input
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Personal */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <ThemedSelect
                isMulti
                options={skillOptions}
                value={formData.skills}
                onChange={handleSkillsChange}
                placeholder="Search and select skills..."
                noOptionsMessage={() => "No skills found"}
              />
              <span className="form-helper">
                Search and select as many skills as apply.
              </span>
            </div>

            {/* Location */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Professional */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Experience (years)</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Social Links */}
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Twitter URL</label>
              <input
                name="twitterUrl"
                value={formData.twitterUrl}
                onChange={handleChange}
                className="input"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting}
              style={{ marginTop: 8 }}
            >
              {submitting ? "Updating…" : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </HomeLayout>
  );
}
