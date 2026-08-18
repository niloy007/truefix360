import { LegalCallout } from "@/components/legal/LegalCallout";
import { LegalList, LegalSection } from "@/components/legal/LegalSection";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { legal, type LegalTocItem } from "@/config/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Accessibility Statement",
  description:
    "How TrueFix360 approaches website accessibility, including keyboard use, forms, and how to request assistance.",
  path: "/accessibility",
});

const toc: LegalTocItem[] = [
  { id: "commitment", label: "Our commitment" },
  { id: "practices", label: "Accessibility practices" },
  { id: "keyboard", label: "Keyboard navigation" },
  { id: "forms", label: "Forms and controls" },
  { id: "images", label: "Images and alternative text" },
  { id: "color", label: "Color and readability" },
  { id: "responsive", label: "Responsive design" },
  { id: "assistive", label: "Assistive technology" },
  { id: "limitations", label: "Known limitations" },
  { id: "third-party", label: "Third-party content" },
  { id: "feedback", label: "Accessibility feedback" },
  { id: "improvements", label: "Ongoing improvements" },
  { id: "contact", label: "Contact" },
];

export default function AccessibilityPage() {
  return (
    <LegalPageShell
      eyebrow="Accessibility"
      title="Website Accessibility"
      description="TrueFix360 works to keep this website usable with keyboards, labeled forms, readable contrast, and assistive technologies. This page describes current practices. It is not a certification."
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Accessibility" },
      ]}
      currentHref="/accessibility"
      toc={toc}
      contactTitle="Accessibility assistance"
      contactDescription="If you have trouble using TrueFix360.com, email support@truefix360.com. Include the page URL, a short description of the issue, your browser or device if useful, and a preferred contact method. You do not need to use a web form to request help."
      contactEmails={[legal.supportEmail]}
    >
      <LegalCallout title="Need help using the site?">
        <p>
          Email{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a> if a page, form, or document is
          difficult to use. Please include the page address and what you were trying to do.
        </p>
      </LegalCallout>

      <LegalSection id="commitment" number="01" title="Our commitment">
        <p>
          TrueFix360 intends for property managers, vendors, residents, and other visitors to be able to use
          this website to learn about services, submit requests, and sign in to authorized portals. Accessibility
          is treated as part of ongoing website development, not as a one-time claim.
        </p>
        <p>
          TrueFix360 uses recognized web accessibility practices as part of that work. This statement does not
          claim WCAG certification, ADA certification, or that every page is fully conformant at all times.
        </p>
      </LegalSection>

      <LegalSection id="practices" number="02" title="Accessibility practices">
        <p>Current public pages are built with measures such as:</p>
        <LegalList
          items={[
            "semantic HTML landmarks, including header, navigation, main, and footer;",
            "a skip link to the main content area;",
            "visible focus styles for keyboard users;",
            "labeled form fields, including required-field indication;",
            "status and error messages associated with forms;",
            "buttons and links that can be operated from the keyboard;",
            "mobile navigation that exposes expanded and collapsed state;",
            "FAQ controls that expose expanded and collapsed state;",
            "breadcrumb navigation on interior pages; and",
            "respect for reduced-motion preferences where animations are used.",
          ]}
        />
      </LegalSection>

      <LegalSection id="keyboard" number="03" title="Keyboard navigation">
        <p>
          Primary menus, buttons, links, accordions, and form controls are intended to be usable with a
          keyboard. A skip-to-content link is available so keyboard users can move past repeating header
          navigation. Focus is shown with an outline rather than relying on hover alone.
        </p>
      </LegalSection>

      <LegalSection id="forms" number="04" title="Forms and controls">
        <p>
          Public forms use visible labels connected to their inputs. Required fields are marked. Validation
          messages are presented as alerts so they can be noticed by assistive technology. File-upload controls
          include text instructions for accepted file types.
        </p>
        <p>
          If a form is difficult to complete, you may email the same information to {legal.supportEmail} instead
          of using the web form.
        </p>
      </LegalSection>

      <LegalSection id="images" number="05" title="Images and alternative text">
        <p>
          Content images used to explain services generally include alternative text. The logo is labeled as
          TrueFix360. Some layout or atmospheric images are marked as decorative. If an image is needed to
          understand a page and the text is insufficient, please tell us.
        </p>
      </LegalSection>

      <LegalSection id="color" number="06" title="Color and readability">
        <p>
          The site uses charcoal text on cream or white backgrounds, white text on charcoal, and orange for
          emphasis and actions. Focus outlines use the brand orange. Color is not intended to be the only way
          to identify required fields or errors; labels and text messages are also used.
        </p>
        <p>
          We aim for readable contrast in ordinary viewing conditions. This is not a claim that every component
          has been independently contrast-tested against a specific WCAG grade.
        </p>
      </LegalSection>

      <LegalSection id="responsive" number="07" title="Responsive design">
        <p>
          Layouts adapt from large screens to common phone widths. Text is intended to remain readable without
          requiring horizontal scrolling on the main content column. Navigation collapses into a mobile menu
          on smaller screens.
        </p>
      </LegalSection>

      <LegalSection id="assistive" number="08" title="Assistive technology and browsers">
        <p>
          The website is designed to work with current versions of major browsers and with common assistive
          technologies that rely on standard HTML. We do not test every browser, plugin, or assistive-technology
          combination, and behavior can vary by user settings.
        </p>
      </LegalSection>

      <LegalSection id="limitations" number="09" title="Known limitations">
        <p>Accessibility is an ongoing process. Current limitations include:</p>
        <LegalList
          items={[
            "some third-party or embedded content may not follow the same patterns as TrueFix360 pages;",
            "authenticated portal screens are operational tools and may be denser than marketing pages;",
            "maps, file previews, and download links can vary in usability depending on the browser and file type; and",
            "older browsers or heavily customized assistive setups may not behave as expected.",
          ]}
        />
        <p>Reported barriers are reviewed as part of ongoing development. We do not promise a fixed response time.</p>
      </LegalSection>

      <LegalSection id="third-party" number="10" title="Third-party content">
        <p>
          Coverage maps, hosted files, authentication, and email services are provided in part by third parties.
          Those tools have their own interfaces and accessibility behavior. TrueFix360 cannot certify third-party
          accessibility.
        </p>
      </LegalSection>

      <LegalSection id="feedback" number="11" title="Accessibility feedback">
        <p>If you encounter a barrier, email {legal.supportEmail}. Please include:</p>
        <LegalList
          items={[
            "the page URL;",
            "a description of the issue;",
            "your browser or device, if useful; and",
            "a preferred way to reach you.",
          ]}
        />
        <p>You do not have to use the website contact form to report an accessibility problem.</p>
      </LegalSection>

      <LegalSection id="improvements" number="12" title="Ongoing improvements">
        <p>
          TrueFix360 expects to keep improving labels, focus handling, content structure, and portal usability
          as the platform grows. This page will be updated when those practices change in a material way.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="13" title="Contact">
        <p>
          Accessibility assistance:{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
