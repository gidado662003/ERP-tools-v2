"use client";
import React, { useState, useEffect } from "react";
import { Module } from "@/lib/module/moduleType";
import { moduleAppAPI } from "@/lib/module/moduleApi";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { getDepartments } from "@/app/api";

const CLS = {
  page: "font-sans",
  pageTitle: "text-[15px] font-medium text-foreground mb-1",
  pageSub: "text-[12px] text-muted-foreground mb-5",
  card: "bg-background border border-[#e0dfe3] dark:border-border/20 rounded-xl p-5 flex flex-col gap-4 dark:bg-[#141320]",
  sectionLabel:
    "text-[11px] font-medium tracking-[.05em] uppercase text-muted-foreground mb-2.5",
  divider: "h-px bg-[#e0dfe3] dark:bg-border/20",
  grid2: "grid grid-cols-2 gap-2.5",
  field: "flex flex-col gap-1.5",
  label: "text-[12px] text-muted-foreground",
  input:
    "h-[34px] border border-[#e0dfe3] dark:border-border/20 rounded-md px-2.5 text-[13px] text-foreground bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#6c5fc7] dark:bg-[#1a1825] w-full transition-colors",
  colorGrid: "grid grid-cols-3 gap-2",
  colorWrap:
    "h-[34px] flex items-center gap-2 border border-[#e0dfe3] dark:border-border/20 rounded-md px-2.5 bg-background dark:bg-[#1a1825] cursor-pointer overflow-hidden",
  colorSwatch: "w-4 h-4 rounded shrink-0",
  colorHex: "text-[12px] text-muted-foreground font-mono",
  colorInput: "absolute opacity-0 w-0 h-0 pointer-events-none",
  deptWrap:
    "flex flex-wrap gap-1.5 p-2.5 border border-[#e0dfe3] dark:border-border/20 rounded-md min-h-[38px] bg-background dark:bg-[#1a1825]",
  deptChip:
    "inline-flex items-center gap-1.5 bg-[#EEEDFE] text-[#534AB7] dark:bg-[#26215C] dark:text-[#AFA9EC] text-[11px] font-medium px-2 py-1 rounded-full",
  deptChipX:
    "cursor-pointer text-[#7F77DD] dark:text-[#AFA9EC] leading-none hover:text-[#534AB7] transition-colors",
  deptAddRow: "flex gap-2 mt-2",
  deptSelect:
    "flex-1 h-[34px] border border-[#e0dfe3] dark:border-border/20 rounded-md px-2.5 text-[13px] text-foreground bg-background dark:bg-[#1a1825] focus:outline-none focus:border-[#6c5fc7]",
  deptBtn:
    "h-[34px] px-3.5 border border-[#e0dfe3] dark:border-border/20 rounded-md text-[12px] font-medium text-muted-foreground bg-background dark:bg-[#1a1825] hover:text-foreground hover:border-[#b0adb8] cursor-pointer transition-colors whitespace-nowrap",
  toggleRow: "flex items-center justify-between",
  toggleLabel: "text-[13px] text-foreground",
  toggleSub: "text-[11px] text-muted-foreground mt-0.5",
  toggle: (on: boolean) =>
    `w-[34px] h-5 rounded-full relative cursor-pointer transition-colors shrink-0 ${
      on ? "bg-[#6c5fc7]" : "bg-[#e0dfe3] dark:bg-border/30"
    }`,
  toggleKnob: (on: boolean) =>
    `w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${
      on ? "left-[17px]" : "left-[3px]"
    }`,
  previewCard:
    "relative flex items-center gap-3 p-3.5 border border-[#e0dfe3] dark:border-border/20 rounded-xl overflow-hidden bg-background dark:bg-[#141320]",
  previewBar: "absolute top-0 left-0 right-0 h-[1.5px]",
  previewIcon:
    "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0",
  previewName: "text-[13px] font-medium text-foreground",
  previewDesc: "text-[11px] text-muted-foreground",
  submitBtn:
    "h-9 w-full bg-[#6c5fc7] hover:bg-[#5b4fb5] text-white rounded-md text-[13px] font-medium cursor-pointer disabled:opacity-50 transition-colors border-0",
};

type ModuleForm = Omit<Module, "allowedDepartments"> & {
  allowedDepartments: string[];
};

const DEFAULT_MODULE: ModuleForm = {
  key: "",
  name: "",
  description: "",
  href: "",
  allowedDepartments: [],
  isActive: true,
  order: 0,
  isSystem: false,
  ui: {
    icon: "Box",
    accent: "#6c5fc7",
    iconBg: "#EEEDFE",
    iconColor: "#534AB7",
    badgeBg: "#D1FAE5",
    badgeColor: "#0F6E56",
  },
};

const COLOR_FIELDS: {
  key: string;
  label: string;
  uiKey: keyof ModuleForm["ui"];
}[] = [
  { key: "ui.accent", label: "Accent", uiKey: "accent" },
  { key: "ui.iconBg", label: "Icon background", uiKey: "iconBg" },
  { key: "ui.iconColor", label: "Icon color", uiKey: "iconColor" },
  { key: "ui.badgeBg", label: "Badge background", uiKey: "badgeBg" },
  { key: "ui.badgeColor", label: "Badge color", uiKey: "badgeColor" },
];

export default function CreateModule() {
  const [module, setModule] = useState<ModuleForm>(DEFAULT_MODULE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState<string>("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const data = await getDepartments(search);
        setDepartments(data.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length === 1) {
      setModule((prev) => ({ ...prev, [name]: value }));
    } else {
      const [parent, child] = keys;
      setModule((prev) => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value },
      }));
    }
  };

  const addDepartment = () => {
    if (!selectedDeptName) return;
    const already = module.allowedDepartments.some(
      (d) => d === selectedDeptName,
    );
    if (already) return;
    setModule((prev) => ({
      ...prev,
      allowedDepartments: [...prev.allowedDepartments, selectedDeptName],
    }));
    setSelectedDeptName("");
  };

  const removeDepartment = (deptName: string) => {
    setModule((prev) => ({
      ...prev,
      allowedDepartments: prev.allowedDepartments.filter((d) => d !== deptName),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await moduleAppAPI.createModule(module);
      toast.success("Module created successfully");
      setModule(DEFAULT_MODULE);
    } catch {
      toast.error("Failed to create module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Icon =
    (Icons[module.ui.icon as keyof typeof Icons] as React.ElementType) ||
    Icons.Box;

  // Departments not yet selected
  const availableDepts = departments.filter(
    (d) => !module.allowedDepartments.some((a) => a === d),
  );

  return (
    <div className={CLS.page}>
      <div className={CLS.card}>
        {/* Identity */}
        <div>
          <p className={CLS.sectionLabel}>Identity</p>
          <div className={`${CLS.grid2} mb-2.5`}>
            <div className={CLS.field}>
              <label className={CLS.label}>Module key</label>
              <input
                name="key"
                value={module.key}
                onChange={handleChange}
                placeholder="e.g. inventory"
                className={CLS.input}
              />
            </div>
            <div className={CLS.field}>
              <label className={CLS.label}>Name</label>
              <input
                name="name"
                value={module.name}
                onChange={handleChange}
                placeholder="e.g. Inventory System"
                className={CLS.input}
              />
            </div>
          </div>
          <div className={`${CLS.field} mb-2.5`}>
            <label className={CLS.label}>Description</label>
            <input
              name="description"
              value={module.description}
              onChange={handleChange}
              placeholder="Short description shown on the home page"
              className={CLS.input}
            />
          </div>
          <div className={CLS.field}>
            <label className={CLS.label}>Path</label>
            <input
              name="href"
              value={module.href}
              onChange={handleChange}
              placeholder="/inventory"
              className={CLS.input}
            />
          </div>
        </div>

        <div className={CLS.divider} />

        {/* Appearance */}
        <div>
          <p className={CLS.sectionLabel}>Appearance</p>
          <div className={`${CLS.field} mb-2.5`}>
            <label className={CLS.label}>Icon name</label>
            <input
              name="ui.icon"
              value={module.ui.icon}
              onChange={handleChange}
              placeholder="Lucide icon name, e.g. Package"
              className={CLS.input}
            />
          </div>
          <div className={CLS.colorGrid}>
            {COLOR_FIELDS.map(({ key, label, uiKey }) => (
              <div key={key} className={CLS.field}>
                <label className={CLS.label}>{label}</label>
                <label className={CLS.colorWrap}>
                  <div
                    className={CLS.colorSwatch}
                    style={{ background: module.ui[uiKey] }}
                  />
                  <span className={CLS.colorHex}>{module.ui[uiKey]}</span>
                  <input
                    type="color"
                    name={key}
                    value={module.ui[uiKey]}
                    onChange={handleChange}
                    className={CLS.colorInput}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={CLS.divider} />

        {/* Access */}
        <div>
          <p className={CLS.sectionLabel}>Access</p>
          <div className={CLS.deptWrap}>
            {module.allowedDepartments.length === 0 ? (
              <span className="text-[12px] text-muted-foreground/50">
                No departments added — all users can access
              </span>
            ) : (
              module.allowedDepartments.map((dept: string) => (
                <span key={dept} className={CLS.deptChip}>
                  {dept}
                  <span
                    className={CLS.deptChipX}
                    onClick={() => removeDepartment(dept)}
                  >
                    ×
                  </span>
                </span>
              ))
            )}
          </div>
          <div className={CLS.deptAddRow}>
            <select
              value={selectedDeptName}
              onChange={(e) => setSelectedDeptName(e.target.value)}
              onFocus={() => setSearch("")}
              className={CLS.deptSelect}
            >
              <option value="">Add department…</option>
              {availableDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <button className={CLS.deptBtn} onClick={addDepartment}>
              Add
            </button>
          </div>
        </div>

        <div className={CLS.divider} />

        {/* Settings */}
        <div className="flex flex-col gap-3">
          <p className={CLS.sectionLabel}>Settings</p>
          {(
            [
              {
                key: "isActive",
                label: "Active",
                sub: "Module is visible on the home page",
              },
              {
                key: "isSystem",
                label: "System module",
                sub: "Cannot be deleted by users",
              },
            ] as const
          ).map(({ key, label, sub }) => (
            <div key={key} className={CLS.toggleRow}>
              <div>
                <div className={CLS.toggleLabel}>{label}</div>
                <div className={CLS.toggleSub}>{sub}</div>
              </div>
              <div
                className={CLS.toggle(module[key])}
                onClick={() =>
                  setModule((prev) => ({ ...prev, [key]: !prev[key] }))
                }
              >
                <div className={CLS.toggleKnob(module[key])} />
              </div>
            </div>
          ))}
        </div>

        <div className={CLS.divider} />

        {/* Preview */}
        <div>
          <p className={CLS.sectionLabel}>Preview</p>
          <div className={CLS.previewCard}>
            <div
              className={CLS.previewBar}
              style={{ background: module.ui.accent }}
            />
            <div
              className={CLS.previewIcon}
              style={{ background: module.ui.iconBg }}
            >
              <Icon size={15} style={{ color: module.ui.iconColor }} />
            </div>
            <div>
              <div className={CLS.previewName}>
                {module.name || "Module name"}
              </div>
              <div className={CLS.previewDesc}>
                {module.description || "Short description shown here"}
              </div>
            </div>
          </div>
        </div>

        <button
          className={CLS.submitBtn}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create module"}
        </button>
      </div>
    </div>
  );
}
