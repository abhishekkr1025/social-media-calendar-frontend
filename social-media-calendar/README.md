# Social Media Calendar Manager

A simple web-based tool to manage social media posting schedules for multiple clients.

## Features

- ✅ **Multi-client management** - Organize posts by different clients
- ✅ **Calendar view** - Visual scheduling interface with date grouping
- ✅ **Post scheduling** - Plan content with dates and times
- ✅ **Platform selection** - Specify which social media platforms (Facebook, Instagram, Twitter, LinkedIn, YouTube)
- ✅ **Export capability** - Download your schedule as CSV
- ✅ **Data persistence** - All data saved to browser localStorage
- ✅ **Delete posts** - Remove scheduled posts easily

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. **Extract the zip file**
   ```bash
   unzip social-media-calendar-complete.zip
   cd social-media-calendar
   ```

2. **Install dependencies**
   
   Using pnpm (recommended):
   ```bash
   pnpm install
   ```
   
   Or using npm:
   ```bash
   npm install
   ```

3. **Start development server**
   
   Using pnpm:
   ```bash
   pnpm run dev
   ```
   
   Or using npm:
   ```bash
   npm run dev
   ```

4. **Open in browser**
   
   Navigate to `http://localhost:5173/`

### Build for Production

To create a production build:

Using pnpm:
```bash
pnpm run build
```

Or using npm:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Using pnpm:
```bash
pnpm run preview
```

Or using npm:
```bash
npm run preview
```

## Project Structure

```
social-media-calendar/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/          # UI components (shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Usage Guide

### Adding a Client

1. Click the **"+ Add"** button in the Clients section
2. Enter the client name
3. Click **"Add"** to save

### Scheduling a Post

1. Select a client from the Clients list
2. Click **"+ Schedule New Post"**
3. Fill in the form:
   - Select the client
   - Enter post content
   - Choose date and time
   - Select target platforms
4. Click **"Add Post"**

**Note**: There is currently a known issue with the time input field. If you experience issues, please ensure you click directly in the time field and use the browser's time picker.

### Viewing Posts

- Click **"All Clients"** to see all scheduled posts
- Click on a specific client to filter posts for that client only
- Posts are organized by date with platform icons

### Deleting a Post

- Click the delete (trash) icon on any post card
- The post will be removed immediately

### Exporting Schedule

- Click **"Export CSV"** button at the top right
- A CSV file will be downloaded with all scheduled posts
- File includes: Client, Date, Time, Content, and Platforms

## Known Issues

### Time Input Synchronization

The time input field in the "Add Post" form has a React state synchronization issue when manually typing the time. 

**Workaround**: Use the browser's native time picker by clicking the clock icon in the time input field.

**Technical details**: This is a known issue with controlled inputs in React when browser autofill or native pickers interact with the component state.

## Technologies Used

- **React 18** - UI framework
- **Vite 6** - Build tool and dev server
- **Lucide React** - Icon library
- **shadcn/ui** - UI component library
- **LocalStorage** - Data persistence

## Data Storage

All data is stored locally in your browser's localStorage. This means:

- ✅ Data persists across browser sessions
- ✅ No server or database required
- ⚠️ Data is not synced across devices
- ⚠️ Clearing browser data will delete all posts and clients

**Recommendation**: Regularly export your schedule as CSV for backup.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

## Future Enhancements

Potential features for future versions:

- Fix time input synchronization issue
- Post editing functionality
- Drag-and-drop rescheduling
- Recurring posts
- Image attachments
- Social media API integration
- User authentication
- Cloud storage/sync
- Mobile app version
- Analytics and reporting

## License

This project is provided as-is for personal and commercial use.

## Support

For issues or questions, please refer to the status report document included with this project.

---

**Version**: 1.0.0  
**Last Updated**: October 2025
