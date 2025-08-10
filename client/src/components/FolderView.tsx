import type { File } from "../../../server/lib/db";
import { formatFileSize } from "../utils/fileSize";

export function FolderView({
  folder,
  files,
}: {
  folder: string;
  files: File[];
}) {
  return (
    <div>
      <div class="file-container">
        <div class="file-container-header">
          <h1 class="file-container-title">{folder}</h1>
        </div>
        <table class="file-table">
          <thead>
            <tr>
              <th scope="col">name</th>
              <th scope="col">owner</th>
              <th scope="col">last modified</th>
              <th scope="col">size</th>
              <th scope="col">
                <span class="sr-only">actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file: File) => {
                return (
                  <tr>
                    <td class="file-name-cell">
                      <svg
                        class="file-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <a
                        href={`http://localhost:9000/${folder}/${file.name}`}
                        download
                        class="file-name-link"
                      >
                        {file.name}
                      </a>
                    </td>
                    <td>{file.owner}</td>
                    <td>{file.lastModified}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td class="actions-cell">
                      <svg
                        class="actions-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                        />
                      </svg>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <span class="no-files">
                  no files found. you can start by adding some files.
                </span>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
