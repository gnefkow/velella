import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { X } from "lucide-react";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";
import { buildTaxReferenceDisplaySections } from "../../lib/taxReferenceDisplay";
import type { TaxReferenceData } from "../../types/taxReferenceData";

interface TaxReferenceDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxReferenceData: TaxReferenceData | null;
  loading: boolean;
  error: string | null;
}

export default function TaxReferenceDataModal({
  isOpen,
  onClose,
  taxReferenceData,
  loading,
  error,
}: TaxReferenceDataModalProps) {
  if (!isOpen) {
    return null;
  }

  const sections = taxReferenceData
    ? buildTaxReferenceDisplaySections(taxReferenceData)
    : [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tax-reference-data-title"
    >
      <div className="relative mx-[16px] flex max-h-[85vh] w-full max-w-[56rem] flex-col overflow-hidden rounded-[16px] border border-border-secondary bg-bg-primary shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06),0px_4px_8px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-tertiary px-[24px] py-[20px]">
          <div className="min-w-0">
            <h2 id="tax-reference-data-title" className="text-h3 text-text-primary">
              Tax Reference Data
            </h2>
            <Text size="body2" hierarchy="secondary" className="pt-[4px]">
              Current-law federal tax assumptions used by Velella.
            </Text>
          </div>
          <Button
            variant="tertiary"
            size="md"
            icon={<X size={16} />}
            aria-label="Close tax reference data dialog"
            onClick={onClose}
          />
        </div>

        <div className="min-h-0 overflow-y-auto px-[24px] py-[20px]">
          {loading ? (
            <Text size="body1" hierarchy="secondary">
              Loading tax reference data...
            </Text>
          ) : error ? (
            <Text size="body1" hierarchy="secondary">
              {error}
            </Text>
          ) : (
            <Stack gap="xl">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="border-b border-border-tertiary pb-[20px] last:border-b-0 last:pb-0"
                >
                  <Stack gap="sm">
                    <div>
                      <Text size="h5" hierarchy="primary" as="h3">
                        {section.title}
                      </Text>
                      {section.description ? (
                        <Text
                          size="body2"
                          hierarchy="secondary"
                          className="pt-[4px]"
                        >
                          {section.description}
                        </Text>
                      ) : null}
                    </div>

                    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-[minmax(12rem,16rem)_1fr]">
                      {section.rows.map((row) => (
                        <div key={`${section.title}-${row.label}`} className="contents">
                          <dt className="text-body-2 font-medium text-text-secondary">
                            {row.label}
                          </dt>
                          <dd className="m-0 text-body-2 text-text-primary">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {section.notes && section.notes.length > 0 ? (
                      <div>
                        <Text size="body2" hierarchy="secondary">
                          Notes
                        </Text>
                        <ul className="mt-[4px] list-disc pl-[20px] text-body-2 text-text-secondary">
                          {section.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {section.source ? (
                      <Text size="body2" hierarchy="secondary">
                        Source: {section.source.label} (
                        <a
                          href={section.source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          link
                        </a>
                        ) as of {section.source.asOfDate}
                      </Text>
                    ) : null}
                  </Stack>
                </section>
              ))}
            </Stack>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
