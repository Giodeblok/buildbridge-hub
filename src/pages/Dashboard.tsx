import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const mockData = {
    activeProjects: 12,
    totalBudget: 2840000,
    completionRate: 78,
    pendingTasks: 23,
    teamMembers: 45,
    overdueItems: 3
  };

  const recentProjects = [
    { name: "Wooncomplex Amstelveen", progress: 85, budget: 850000, status: "on-track" },
    { name: "Kantoorgebouw Rotterdam", progress: 45, budget: 1200000, status: "delayed" },
    { name: "Renovatie School Utrecht", progress: 92, budget: 320000, status: "ahead" },
    { name: "Sporthal Eindhoven", progress: 23, budget: 470000, status: "on-track" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ahead': return 'Voor op schema';
      case 'delayed': return 'Vertraagd';
      default: return 'Op schema';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-construction-primary mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Realtime overzicht van al je projecten en KPI's
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Projecten</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                +2 deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Budget</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{(mockData.totalBudget / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">
                +8% t.o.v. vorig kwartaal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voortgang</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.completionRate}%</div>
              <Progress value={mockData.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Openstaande Taken</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.pendingTasks}</div>
              <p className="text-xs text-red-600">
                {mockData.overdueItems} over deadline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Projectoverzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Voortgang</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Budget: €{(project.budget / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;