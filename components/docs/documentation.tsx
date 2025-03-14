"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DocSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function DocSection({ id, title, children }: DocSectionProps) {
  return (
    <Card id={id} className="scroll-mt-16">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface TableOfContentsProps {
  sections: { id: string; title: string }[];
  activeSection: string | null;
}

function TableOfContents({ sections, activeSection }: TableOfContentsProps) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={cn(
                      "block text-sm transition-colors hover:text-primary",
                      activeSection === section.id
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DocumentationProps {
  sections: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

export function Documentation({ sections }: DocumentationProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -80% 0px",
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sections]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6">
      <div className="space-y-6">
        {sections.map((section) => (
          <DocSection key={section.id} id={section.id} title={section.title}>
            {section.content}
          </DocSection>
        ))}
      </div>
      <TableOfContents sections={sections} activeSection={activeSection} />
    </div>
  );
}
