import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CertificateLightbox } from "@/components/certificates/CertificateLightbox";
import type { CertificateItem } from "@/data/content";

const cert: CertificateItem = {
  id: "x",
  title: "My Certificate",
  issuer: "Some Issuer",
  category: "achievement",
  preview: "certificates/previews/x.jpg",
  file: "certificates/files/x.pdf",
  fileType: "pdf",
};

describe("CertificateLightbox", () => {
  it("shows a single image with Open/Download and no thumbnail strip", () => {
    render(<CertificateLightbox certificate={cert} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "My Certificate" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Some Issuer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /view image/i })).toBeNull();
  });

  it("calls onClose on Escape and via the close button", () => {
    const onClose = vi.fn();
    render(<CertificateLightbox certificate={cert} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /close viewer/i }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renders a thumbnail strip and toggles per-slide download for a gallery", () => {
    const slides = [
      { image: "images/awards/iho.jpg" }, // no file → no download
      {
        image: "certificates/previews/x.jpg",
        file: "certificates/files/x.pdf",
      },
    ];
    render(
      <CertificateLightbox
        certificate={{ ...cert, file: undefined }}
        slides={slides}
        onClose={() => {}}
      />,
    );

    const thumbs = screen.getAllByRole("button", { name: /view image/i });
    expect(thumbs).toHaveLength(2);

    // First slide (photo) has no downloadable file.
    expect(screen.queryByRole("link", { name: /download/i })).toBeNull();

    // Switching to the certificate slide reveals the download link.
    fireEvent.click(thumbs[1]);
    expect(screen.getByRole("link", { name: /download/i })).toBeInTheDocument();
  });
});
