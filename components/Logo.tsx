"use client";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="288"
      height="42"
      viewBox="0 0 288 42"
      fill="none"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 36V6H18V24H6V36H0ZM6 12H12V18H6V12Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 36V6H42V24H30V36H24ZM30 12H36V18H30V12ZM36 24L42 36H36L30 24H36Z"
      />
      <path d="M66 24H54V18H66V24Z" fill="currentColor" />
      <path d="M48 36V6H54V36H48ZM72 36V6H66V36H72ZM66 12H54V6H66V12Z" fill="currentColor" />
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M78 36V6H96V36H78ZM84 12H90V18H84V12ZM84 24H90V30H84V24Z" />
      <path d="M120 24H108V18H120V24Z" fill="currentColor" />
      <path d="M102 36V6H108V36H102ZM126 36V6H120V36H126Z" fill="currentColor" />
      <path d="M150 24H138V18H150V24Z" fill="currentColor" />
      <path d="M132 36V6H138V36H132ZM156 36V6H150V36H156ZM150 12H138V6H150V12Z" fill="currentColor" />
      <path d="M162 12V6H186V12H162Z" fill="currentColor" />
      <path d="M171 36V12H177V36H171Z" fill="currentColor" />
      <path d="M210 36H198V30H210V36Z" fill="currentColor" />
      <path d="M192 36V6H198V36H192Z" fill="currentColor" />
      <path d="M234 24H222V18H234V24Z" fill="currentColor" />
      <path d="M216 36V6H222V36H216ZM240 36V6H234V36H240ZM234 12H222V6H234V12Z" fill="currentColor" />
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M246 36V6H264V36H246ZM252 12H258V18H252V12ZM252 24H258V30H252V24Z" />
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M270 36V6H288V36H270ZM276 12H288V18H276V12ZM270 24H282V30H270V24Z" />
    </svg>
  );
}
