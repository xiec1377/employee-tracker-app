export function formatDate (dateString: string) : string {
    // console.log("datestring:", dateString)
    if (!dateString) return ""
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
  
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };