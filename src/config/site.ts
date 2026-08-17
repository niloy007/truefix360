import { company } from "@/config/company";

export const site = {
  name: company.name,
  url: company.url,
  title: "TrueFix360 | Property Preservation & Property Maintenance",
  description:
    "TrueFix360 provides professional property preservation and maintenance services through a growing U.S. field-service network. Explore coverage, request service, access the client portal, or join our vendor network.",
  locale: "en_US",
} as const;

export const formSubmission = {
  mode: "placeholder" as const,
  endpoint: "/api/forms",
};
