# FormData Examples for Reqline

This document provides practical examples of how to use the new FormData functionality in Reqline for file uploads.

## Basic FormData Examples

### 1. Upload Profile Picture

**Reqline Statement:**

```
HTTP POST | URL https://api.example.com/users/profile-picture | FORMDATA {"profile_picture": {"type": "file", "path": "/Users/username/Pictures/profile.jpg", "filename": "profile.jpg", "contentType": "image/jpeg"}, "user_id": "12345"}
```

**What this does:**

- Uploads a profile picture file
- Sends additional user_id field
- Uses proper MIME type for JPEG images

### 2. Upload Multiple Documents

**Reqline Statement:**

```
HTTP POST | URL https://api.example.com/documents/upload | FORMDATA {"resume": {"type": "file", "path": "/Users/username/Documents/resume.pdf", "filename": "john_doe_resume.pdf", "contentType": "application/pdf"}, "cover_letter": {"type": "file", "path": "/Users/username/Documents/cover_letter.docx", "filename": "cover_letter.docx", "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}, "name": "John Doe", "email": "john@example.com"}
```

**What this does:**

- Uploads resume (PDF) and cover letter (DOCX)
- Sends additional form fields (name, email)
- Uses appropriate MIME types for each file type

### 3. Simple Form Submission with File

**Reqline Statement:**

```
HTTP POST | URL https://api.example.com/contact | FORMDATA {"name": "Jane Smith", "email": "jane@example.com", "message": "Please find attached document", "attachment": {"type": "file", "path": "/Users/username/Documents/report.txt"}}
```

**What this does:**

- Submits a contact form with text fields
- Attaches a text file (uses default MIME type)

## File Type Examples

### Image Files

```json
{
  "image": {
    "type": "file",
    "path": "/path/to/image.jpg",
    "filename": "photo.jpg",
    "contentType": "image/jpeg"
  }
}
```

### PDF Documents

```json
{
  "document": {
    "type": "file",
    "path": "/path/to/document.pdf",
    "filename": "report.pdf",
    "contentType": "application/pdf"
  }
}
```

### Text Files

```json
{
  "log_file": {
    "type": "file",
    "path": "/path/to/log.txt",
    "filename": "error_log.txt",
    "contentType": "text/plain"
  }
}
```

### Excel Files

```json
{
  "spreadsheet": {
    "type": "file",
    "path": "/path/to/data.xlsx",
    "filename": "sales_data.xlsx",
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

## Common MIME Types

| File Type     | MIME Type                                                                 |
| ------------- | ------------------------------------------------------------------------- |
| JPEG Image    | `image/jpeg`                                                              |
| PNG Image     | `image/png`                                                               |
| GIF Image     | `image/gif`                                                               |
| PDF Document  | `application/pdf`                                                         |
| Text File     | `text/plain`                                                              |
| HTML File     | `text/html`                                                               |
| CSS File      | `text/css`                                                                |
| JavaScript    | `application/javascript`                                                  |
| JSON File     | `application/json`                                                        |
| XML File      | `application/xml`                                                         |
| ZIP Archive   | `application/zip`                                                         |
| Excel (.xlsx) | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`       |
| Word (.docx)  | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

## Error Handling Examples

### File Not Found

```
Error: File not found: /path/to/nonexistent/file.jpg
```

### Invalid File Path (Directory)

```
Error: Path is not a file: /path/to/directory
```

### Missing File Path

```
Error: File field "profile_picture" must have a "path" property
```

### Using Both BODY and FORMDATA

```
Error: Cannot use both BODY and FORMDATA in the same request
```

## Testing with httpbin.org

You can test your FormData uploads using httpbin.org, which echoes back the received data:

```
HTTP POST | URL https://httpbin.org/post | FORMDATA {"file": {"type": "file", "path": "/path/to/test.txt", "filename": "test.txt"}, "message": "Hello World"}
```

This will return a response showing exactly what was received, including the multipart form data.

## Best Practices

1. **Use Absolute Paths**: Always use absolute paths to your files
2. **Set Appropriate MIME Types**: Use the correct content type for your files
3. **Provide Meaningful Filenames**: Set the filename to something descriptive
4. **Validate File Existence**: The system will check if files exist before uploading
5. **Don't Mix BODY and FORMDATA**: Use one or the other, not both
6. **Handle Errors Gracefully**: Check for file not found and other errors

## Integration with Existing APIs

The FormData functionality works seamlessly with existing APIs that expect multipart/form-data, such as:

- File upload APIs
- Profile picture uploads
- Document management systems
- Content management systems
- Social media APIs with media uploads
- E-commerce product image uploads
