import React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
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

  let refreshUpcomingEvents: (() => void) | null = null;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCreateEvent = () => {
    setShowEventForm(true);
  };

  const handleBackToChannel = () => {
    setShowEventForm(false);
  };

  const handleEventCreated = async () => {
    setShowEventForm(false);
    if (refreshUpcomingEvents) {
      await refreshUpcomingEvents();
    }
    showSnackbar("Event created successfully!", "success");
  };

  const handleEventError = (message: string) => {
    showSnackbar(message, "error");
  };

  if (showEventForm) {
    return (
      <section className="px-6 py-8 sm:px-8 lg:px-10 h-screen overflow-y-auto">
        <CreateEvent
          onBack={handleBackToChannel}
          onEventCreated={handleEventCreated}
          onError={handleEventError}
        />
      </section>
    );
  }

  return (
    <section className="px-6 py-8 sm:px-8 lg:px-10 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
          To receive messages from your streaming platform&apos;s chat inside a
          session, <span className="font-medium text-slate-600">first connect that platform in Settings → Integrations.</span> Choose
          the service you use (for example Twitch or YouTube) and log in so chat
          messages can be relayed into your session chat.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <Box
          sx={{
            width: "fit-content",
            borderBottom: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="dashboard tabs"
            sx={{
              "& .MuiTab-root": {
                color: "#94a3b8",
                fontWeight: 500,
                fontSize: "14px",
                textTransform: "none",
                "&.Mui-selected": {
                  color: "#0ea5e9",
                },
                paddingLeft: 0,
                paddingRight: "24px",
                paddingTop: 0,
                paddingBottom: "12px",
                minWidth: "unset",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#0ea5e9",
                height: 2,
                borderRadius: "2px 2px 0 0",
              },
            }}
          >
            <Tab label="Upcoming events" {...a11yProps(0)} />
            <Tab label="Live events" {...a11yProps(1)} />
            <Tab label="Past events" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
          sx={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "10px",
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
            textTransform: "none",
            '&:hover': {
              background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
            },
          }}
        >
          Schedule Event
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
