import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('card', className)} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('card-header', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => (
  <h3 className={cn('card-title', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children, ...props }) => (
  <p className={cn('card-description', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => (
  <div className={cn('card-content', className)} {...props}>
    {children}
  </div>
);
