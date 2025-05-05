# Responsive Netflix Clone Navbar Implementation

This implementation provides a responsive navbar solution with separate components for desktop and mobile/tablet devices.

## Components

### 1. DesktopNavbar

- `DesktopNavbar.jsx` - A navbar optimized for desktop screens
- Displayed only on medium screens and larger (>= 768px)
- Features:
  - Full navigation menu
  - Expandable search with dropdown results
  - User profile dropdown
  - AI recommendation button
  - Notification bell

### 2. MobileNavbar

- `MobileNavbar.jsx` - A navbar optimized for mobile and tablet screens
- Displayed only on small screens (< 768px)
- Features:
  - **Top Navbar**:
    - Simplified header with Netflix logo
    - Hamburger menu toggle
    - User profile icon
  - **Bottom Navbar**:
    - Home icon
    - Trending icon
    - Search icon with popup search interface
    - TV Shows icon
    - AI Recommend icon
  - **Side Menu**:
    - Sliding panel opened from hamburger menu
    - Profile selection area
    - Full navigation links
    - Category accordions
    - AI recommendation button

## How It Works

The App.jsx file uses window.innerWidth to detect screen size and conditionally renders only one navbar at a time:

```jsx
// In App.jsx
const [isMobile, setIsMobile] = useState(false)

// Check if the screen is mobile or desktop
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  // Initial check & add resize listener
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Conditionally render the appropriate navbar
{isMobile ? <MobileNavbar /> : <DesktopNavbar />}
```

### Responsive Behavior

- On desktop: Only the DesktopNavbar is rendered
- On mobile/tablet: Only the MobileNavbar is rendered with both top and bottom navbars
- On window resize: The appropriate navbar is automatically switched

### Mobile Bottom Navbar

The mobile layout features a bottom navigation bar inspired by popular streaming apps:

- Fixed to the bottom of the screen
- Contains frequently used navigation options as icons with labels
- Search functionality opens upward from the search icon
- AI recommendation is featured prominently

### Search Implementation

The mobile version has two ways to access search:

1. **From top navbar**: Opens a full-screen search overlay
2. **From bottom navbar**: Opens a popup search interface that appears above the bottom navbar

Both search methods use the same `SearchDropdown` component with the `isMobile` prop.

## Components Architecture

```
App.jsx (determines which navbar to show)
├── DesktopNavbar.jsx (shown when width >= 768px)
│   └── SearchDropdown.jsx (with isMobile=false)
│       └── MovieSuggestionCard.jsx
└── MobileNavbar.jsx (shown when width < 768px)
    ├── Top Navbar
    ├── Bottom Navbar with Icons
    │   └── SearchDropdown.jsx (with isMobile=true)
    │       └── MovieSuggestionCard.jsx
    └── Side Menu Panel
```

## Design Considerations

- Mobile design follows modern streaming apps with split navigation
- Top navbar for branding and menu access, bottom navbar for frequent actions
- Bottom navbar provides easy thumb access to common functions
- The search experience changes based on where it's activated
- AI recommendation feature is available in both the side menu and bottom navbar
- Both navbar versions maintain the Netflix look and feel
- The mobile navbar uses a sliding panel similar to the official Netflix mobile app
- User state is shared between both navbars (search results, recommendations, etc.)
- The design includes subtle animations for a premium feel
- Background color changes on scroll for improved visibility 