export function html(html: string): string {
  return `${/^<!DOCTYPE html>/i.test(html) && "<!DOCTYPE html>"}
  <head>
    <script optic::internal src="${__optic$config.files.dir}${
      __optic$config.files.config
    }"></script>
    <script optic::internal src="${__optic$config.files.dir}${
      __optic$config.files.shared
    }"></script>
    <script optic::internal src="${__optic$config.files.dir}${
      __optic$config.files.client
    }"></script>
  </head>${html}`;
}
