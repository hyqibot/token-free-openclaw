"""Module providing the SequentialOp class for serial operation execution."""

from .base_op import BaseOp


class SequentialOp(BaseOp):
    """Operation class that executes sub-operations one after another in order."""

    async def execute(self):
        """Executes sub-operations sequentially using asynchronous awaits."""
        result = None
        for op in self.sub_ops:
            assert op.async_mode
            result = await op.call(context=self.context)
        return result

    def execute_sync(self):
        """Executes sub-operations sequentially in a synchronous blocking manner."""
        result = None
        for op in self.sub_ops:
            assert not op.async_mode
            result = op.call_sync(context=self.context)
        return result

    def __lshift__(self, op: dict[str, BaseOp] | list[BaseOp] | BaseOp):
        """Raises RuntimeError as the left shift operator is not supported."""
        raise RuntimeError(f"`<<` is not supported in `{self.name}`")

    def __rshift__(self, op: BaseOp):
        """Appends operations to the sequence using the bitwise right shift operator."""
        if isinstance(op, SequentialOp) and op.sub_ops:
            self.add_sub_ops(op.sub_ops)
        else:
            self.add_sub_op(op)
        return self
