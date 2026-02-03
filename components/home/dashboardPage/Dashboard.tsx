import React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Button from "@mui/material/Button";
import PastEventList from "./PastEventList";
import LiveEventList from "./LiveEventList";
import { fetchUpcmingEvents } from "@/actions/events";
import CreateEvent from "@/components/home/events/CreateEvent";
import { useGlobalSnackbar } from '@/contexts/SnackbarContext';
import EventsTab from "./EventsTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ paddingTop: "20px" }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Dashboard: React.FC = () => {
  const { showSnackbar } = useGlobalSnackbar();
  const [value, setValue] = React.useState(0);
  const [showEventForm, setShowEventForm] = React.useState(false);

  let refreshUpcomingEvents: (() => void) | null = null; // Store the refresh function

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCreateEvent = () => {
    setShowEventForm(true);
  };

  const handleBackToChannel = () => {
    setShowEventForm(false);
  };

  // Handle successful event creation
  const handleEventCreated = async () => {
    setShowEventForm(false);
    if (refreshUpcomingEvents) {
      await refreshUpcomingEvents();
    }
    showSnackbar("Event created successfully!", "success");
  };

  // Handle event creation errors
  const handleEventError = (message: string) => {
    showSnackbar(message, "error");
  };

  if (showEventForm) {
    return (
      <section className="px-10 pt-10 h-screen overflow-y-auto">
        <CreateEvent
          onBack={handleBackToChannel}
          onEventCreated={handleEventCreated}
          onError={handleEventError}
        />
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[18px] font-medium">Dashboard</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <Box
          sx={{
            width: "fit-content",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                color: "#CCCCCC", // Default tab color
                "&.Mui-selected": {
                  color: "#27AAFF", // Selected tab color
                },
                // Add padding to control tab width
                paddingLeft: 0,
                paddingRight: "30px",
                paddingTop: 0,
                paddingBottom: 0,
                minWidth: "unset",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#27AAFF",
                height: 3,
              },
            }}
          >
            <Tab
              label="Upcoming events"
              {...a11yProps(0)}
              sx={{ fontSize: "14px", fontWeight: 500 }}
            />
            <Tab
              label="Live events"
              {...a11yProps(1)}
              sx={{ fontSize: "14px", fontWeight: 500 }}
            />
            <Tab
              label="Past events"
              {...a11yProps(2)}
              sx={{ fontSize: "14px", fontWeight: 500 }}
            />
          </Tabs>
        </Box>

        <Button
          variant="outlined"
          onClick={handleCreateEvent}
          sx={{
            color: "#27AAFF",
            padding: "10px",
            fontSize: "12px",
            fontWeight: 500,
            borderRadius: "2px",
            borderColor: "#27AAFF",
          }}
        >
          Schedule
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CustomTabPanel value={value} index={0}>
          <EventsTab
            fetchFunction={fetchUpcmingEvents}
            onRefresh={(refreshFn) => {
              refreshUpcomingEvents = refreshFn;
            }}
            onCreateEvent={handleCreateEvent}
          />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <LiveEventList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <PastEventList />
        </CustomTabPanel>
      </div>
    </section>
  );
};

export default Dashboard;
