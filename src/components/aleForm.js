"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CityCombobox } from "./combobox"
import { Button } from "./ui/button"

const formSchema = z.object({
  breweries: z.coerce.number().min(1, "Must be at least 1"), // Changed to coerce
  distance: z.coerce.number().min(1, "Must be at least 1"),   // Changed to coerce
  city: z.string().min(1, "Please select a city"),
})

export function AleForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {  // Add default values
      breweries: "",
      distance: "",
      city: "",
    },
  })

  function onSubmit(values) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="breweries" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Breweries</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="distance" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Distance (mi)</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <CityCombobox 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}