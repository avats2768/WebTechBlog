import { useEffect, useState } from "react";
import Select from "react-select";
import { UploadCloud, X } from "lucide-react";

import { getSkills } from "../../api/choiceApis/skillApi";
import HomeLayout from "../../layouts/HomeLayout";
import { useTheme } from "../../context/ThemeContext"; // adjust path if needed

// Sentinel value for the "Other" skill option — must match what's pushed
// onto skillOptions below, and what hasOtherSkill checks against.
const OTHER_SKILL_VALUE = 0;

export default function AddPost() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [skillOptions, setSkillOptions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    image: null,
    skills: [],
    customSkill: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await getSkills();

      const formattedSkills = response.map((skill) => ({
        value: skill.id,
        label: skill.name,
      }));

      formattedSkills.push({
        value: OTHER_SKILL_VALUE,
        label: "Other",
      });

      setSkillOptions(formattedSkills);
    } catch (error) {
      console.error("Error fetching skills", error);
    }
  };

  const hasOtherSkill = formData.skills.some((s) => s.value === OTHER_SKILL_VALUE);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSkillsChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      skills: selected || [],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();

    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("code", formData.code);

    if (formData.image) {
      payload.append("image", formData.image);
    }

    // Send skill IDs
    payload.append(
      "skills",
      JSON.stringify(formData.skills.map((skill) => skill.value))
    );

    if (hasOtherSkill) {
      payload.append("customSkill", formData.customSkill);
    }

    console.log("Skills IDs:", formData.skills.map((skill) => skill.value));
    console.log([...payload.entries()]);
  };

  // react-select doesn't take className theming, so read the live CSS
  // variables here and pass them straight into its style objects
  const cssVar = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      borderRadius: cssVar("--radius-md", "10px"),
      backgroundColor: cssVar("--card", "#fff"),
      borderColor: state.isFocused ? cssVar("--primary", "#2563eb") : cssVar("--border", "#e2e8f0"),
      boxShadow: state.isFocused ? `0 0 0 1px ${cssVar("--primary", "#2563eb")}` : "none",
      "&:hover": { borderColor: cssVar("--primary", "#2563eb") },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: cssVar("--card", "#fff"),
      border: `1px solid ${cssVar("--border", "#e2e8f0")}`,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? cssVar("--surface", "#f1f5f9") : "transparent",
      color: cssVar("--text-primary", "#0f172a"),
      cursor: "pointer",
    }),
    input: (base) => ({ ...base, color: cssVar("--text-primary", "#0f172a") }),
    placeholder: (base) => ({ ...base, color: cssVar("--text-secondary", "#475569") }),
    singleValue: (base) => ({ ...base, color: cssVar("--text-primary", "#0f172a") }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: cssVar("--surface", "#f8fafc"),
      borderRadius: "9999px",
      paddingLeft: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: cssVar("--primary", "#2563eb"),
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: cssVar("--primary", "#2563eb"),
      borderRadius: "9999px",
      "&:hover": { backgroundColor: cssVar("--border", "#e2e8f0"), color: cssVar("--primary-hover", "#1d4ed8") },
    }),
  };

  return (
    <HomeLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="card p-lg">
          <h1 className="heading-lg" style={{ marginBottom: 4 }}>Create New Post</h1>
          <p className="body-sm" style={{ marginBottom: 32 }}>
            Share an article, snippet or update with the community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter post title"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Write your post..."
                required
              />
            </div>

            {/* Code */}
            <div className="form-group">
              <label className="form-label">Code Snippet</label>
              <textarea
                rows="8"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input"
                style={{ backgroundColor: "var(--surface)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
                placeholder="Paste your code here..."
              />
            </div>

            {/* Image */}
            <div className="form-group">
              <label className="form-label">Featured Image</label>

              {imagePreview ? (
                <div
                  className="relative w-full h-48 overflow-hidden"
                  style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
                >
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="btn btn-ghost btn-icon absolute top-2 right-2"
                    style={{ color: "var(--danger)" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center gap-2 w-full h-32 cursor-pointer transition-colors"
                  style={{ border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}
                >
                  <UploadCloud size={22} className="text-secondary" />
                  <span className="body-sm">Click to upload, or drag an image here</span>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              )}
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="form-label">Skills</label>
              <Select
                key={isDark ? "dark" : "light"} // re-reads CSS vars when theme flips
                isMulti
                options={skillOptions}
                value={formData.skills}
                onChange={handleSkillsChange}
                styles={selectStyles}
                placeholder="Search and select skills..."
                noOptionsMessage={() => "No skills found"}
              />
              <span className="form-helper">Search and select as many skills as apply.</span>
            </div>

            {/* Custom skill */}
            {hasOtherSkill && (
              <div className="form-group">
                <label className="form-label">Custom Skill</label>
                <input
                  type="text"
                  name="customSkill"
                  value={formData.customSkill}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter custom skill"
                />
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="btn btn-primary w-full">
              Publish Post
            </button>
          </form>
        </div>
      </div>
    </HomeLayout>
  );
}