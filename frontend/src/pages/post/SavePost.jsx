import { useEffect, useState } from "react";
import ThemedSelect from "../../components/common/ThemedSelect";
import { ArrowLeft, UploadCloud, X, Loader2 } from "lucide-react";
import { createPost, updatePost, getPostById } from "../../api/postsApi";
import { getSkills } from "../../api/choiceApis/skillApi";
import HomeLayout from "../../layouts/HomeLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext"; // adjust path if needed

// Sentinel value for the "Other" skill option — must match what's pushed
// onto skillOptions below, and what hasOtherSkill checks against.
const OTHER_SKILL_VALUE = 0;

export default function AddPost() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
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
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

  useEffect(() => {
    if (!id) return;

    if (skillOptions.length > 0) {
      fetchPost();
    }
  }, [id, skillOptions.length]);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchPost() {
    try {
      const { data } = await getPostById(id);

      if (!data?.success) return;

      const post = data.data;

      const selectedSkills = skillOptions.filter((skill) =>
        post.skills?.includes(skill.label),
      );

      setFormData({
        title: post.title || "",
        description: post.description || "",
        code: post.code || "",
        image: null,
        skills: selectedSkills,
        customSkill: "",
      });

      if (post.imageUrl) {
        setImagePreview(post.imageUrl);
      }
    } catch (error) {
      console.error("Failed to fetch post", error);
    }
  }

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

  const hasOtherSkill = formData.skills.some(
    (s) => s.value === OTHER_SKILL_VALUE,
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3000);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));

    setImagePreview(null);
    setRemoveExistingImage(true);
  };

  const handleSkillsChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      skills: selected || [],
    }));
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // guard against double submit (double-click / double-tap)

    setSubmitting(true);

    try {
      const payload = new FormData();

      if (id) {
        payload.append("id", id);
      }

      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("code", formData.code);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (removeExistingImage) {
        payload.append("removeImage", "true");
      }

      payload.append(
        "skills",
        JSON.stringify(formData.skills.map((skill) => skill.value)),
      );

      if (hasOtherSkill) {
        payload.append("customSkill", formData.customSkill);
      }

      if (id) {
        await updatePost(id, payload);
      } else {
        await createPost(payload);
      }

      showToast(
        id ? "Post updated successfully" : "Post created successfully",
        "success",
      );

      setTimeout(() => {
        navigate("/");
      }, 1000);
      // Note: submitting intentionally stays true here so the button
      // remains disabled during the navigate() delay above, rather than
      // re-enabling and letting the user submit again before redirect.
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        "danger",
      );

      console.error(error);
      setSubmitting(false);
    }
  };

  return (
    <HomeLayout>
      <div className="max-w-3xl mx-auto p-6">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          style={{ marginBottom: 12 }}
          onClick={handleBackClick}
          aria-label="Go back"
          title="Go back"
          disabled={submitting}
        >
          <ArrowLeft size={16} />
        </button>

        <div className="card p-lg">
          <h1 className="heading-lg">{id ? "Edit Post" : "Create New Post"}</h1>
          <p className="body-sm" style={{ marginBottom: 32 }}>
            Share an article, snippet or update with the community.
          </p>

          <fieldset disabled={submitting} style={{ border: "none", padding: 0, margin: 0 }}>
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
                  style={{
                    backgroundColor: "var(--surface)",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                  }}
                  placeholder="Paste your code here..."
                />
              </div>

              {/* Image */}
              <div className="form-group">
                <label className="form-label">Featured Image</label>

                {imagePreview ? (
                  <div
                    className="relative w-full h-48 overflow-hidden"
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="btn btn-ghost btn-icon absolute top-2 right-2"
                      style={{ color: "var(--danger)" }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center gap-2 w-full h-32 cursor-pointer transition-colors"
                    style={{
                      border: "1px dashed var(--border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <UploadCloud size={22} className="text-secondary" />
                    <span className="body-sm">
                      Click to upload, or drag an image here
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Skills */}
              <div className="form-group">
                <label className="form-label">Skills</label>
                <ThemedSelect
                  isMulti
                  isDisabled={submitting}
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
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {submitting && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {submitting
                  ? id
                    ? "Updating…"
                    : "Publishing…"
                  : id
                  ? "Update Post"
                  : "Publish Post"}
              </button>
            </form>
          </fieldset>
        </div>
      </div>
      {toast.show && (
        <div
          className={`toast ${
            toast.type === "success" ? "toast-success" : "toast-danger"
          }`}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}
    </HomeLayout>
  );
}