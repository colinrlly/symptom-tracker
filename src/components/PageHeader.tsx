import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  children?: ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
}

export function PageHeader({
  title,
  description,
  icon,
  children,
  breadcrumbs
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="text-sm breadcrumbs mb-4">
          <ul>
            {breadcrumbs.map((crumb, index) => (
              <li key={index}>
                {crumb.href ? (
                  <a href={crumb.href} className="link link-hover">
                    {crumb.name}
                  </a>
                ) : (
                  <span className="text-base-content/60">{crumb.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Header Content */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-base-content/70 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && (
          <div className="flex flex-wrap gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}