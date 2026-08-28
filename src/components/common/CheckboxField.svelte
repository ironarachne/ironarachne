<script lang="ts">
  type Props = {
    id: string;
    label: string;
    checked?: boolean;
  };

  let { id, label, checked = $bindable(false) }: Props = $props();
</script>

<!-- `--inline` because a checkbox reads box-then-label: the label is the thing being clicked
     rather than a name for the field below it. See docs/visual-design.md, "The field around a
     control". -->
<div class="input-group input-group--inline">
  <input type="checkbox" {id} bind:checked />
  <label for={id}>{label}</label>
</div>
